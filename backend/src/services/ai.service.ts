import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import { OpenAI } from 'openai';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AiQueryService {
  private openai: OpenAI;
  private modelToUse = 'gpt-4o-mini'; // Try a different model

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {
    // Initialize OpenAI client with AI/ML API configuration
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: 'https://api.aimlapi.com', // AI/ML API base URL
    });
  }

  async getTableSchemas(): Promise<Record<string, any[]>> {
    try {
      // First, let's create a function to get table names in the public schema
      const { data: tableData, error: tableError } =
        await this.supabaseService.supabase.rpc('execute_query', {
          query:
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        });

      if (tableError) {
        console.error('Error fetching tables:', tableError);
        return {};
      }

      // Get schema for each table
      const schemas: Record<string, any[]> = {};
      for (const tableRow of tableData || []) {
        const tableName = tableRow.table_name;

        try {
          const { data: schema, error: schemaError } =
            await this.supabaseService.supabase.rpc('get_table_schema', {
              p_table_name: tableName,
            });

          if (schemaError) throw schemaError;
          schemas[tableName] = schema;
        } catch (err) {
          console.error(`Error fetching schema for table ${tableName}:`, err);
        }
      }

      return schemas;
    } catch (error) {
      console.error('Error in getTableSchemas:', error);
      return {};
    }
  }

  async processQuery(
    userQuery: string,
  ): Promise<{ sql?: string; message: string }> {
    try {
      // Get all table schemas
      const schemas = await this.getTableSchemas();

      // Create a simplified prompt that fits within the 256 character limit
      const simplifiedPrompt =
        'SQL assistant for a Countries app. Answer with SQL in <POSTGRES> tags or natural language.';

      console.log('=== DEBUG: API Request ===');
      console.log(
        'API Key:',
        this.configService.get<string>('OPENAI_API_KEY').substring(0, 5) +
          '...',
      );
      console.log('Base URL:', 'https://api.aimlapi.com');
      console.log('Model:', this.modelToUse);
      console.log('User Query:', userQuery);

      // Create the request payload with a simplified prompt
      const requestPayload = {
        model: this.modelToUse,
        messages: [
          { role: 'system', content: simplifiedPrompt },
          { role: 'user', content: userQuery },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      };

      console.log(
        'Full Request Payload:',
        JSON.stringify(requestPayload, null, 2),
      );
      console.log(
        'Total Characters in Messages:',
        simplifiedPrompt.length +
          userQuery.length +
          JSON.stringify({ role: 'system' }).length +
          JSON.stringify({ role: 'user' }).length,
      );

      // Make a direct HTTPS request to see the raw response
      await this.makeDirectRequest(requestPayload);

      // Call AI/ML API using OpenAI compatible interface
      try {
        const response = await this.openai.chat.completions.create({
          model: this.modelToUse,
          messages: [
            { role: 'system', content: simplifiedPrompt },
            { role: 'user', content: userQuery },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        console.log('=== DEBUG: API Response ===');
        console.log('Response Status:', 'Success');
        console.log(
          'Response Object:',
          JSON.stringify(response, null, 2).substring(0, 500) + '...',
        );

        const aiResponse = response.choices[0].message.content;

        // Extract SQL if present
        const sqlMatch = aiResponse.match(/<POSTGRES>([\s\S]*?)<\/POSTGRES>/);
        const sql = sqlMatch ? sqlMatch[1].trim() : undefined;

        // Extract message (everything outside the POSTGRES tags)
        let message = aiResponse
          .replace(/<POSTGRES>[\s\S]*?<\/POSTGRES>/, '')
          .trim();
        if (!message && sql) {
          message = "I've generated a SQL query based on your request.";
        }

        // If we have SQL, try to enhance the response with table information
        if (sql) {
          // Process the SQL with our knowledge of the tables
          message = this.enhanceResponseWithTableInfo(message, sql, schemas);
        }

        return { sql, message };
      } catch (apiError) {
        console.log('=== DEBUG: API Error ===');
        console.log('Error Type:', apiError.constructor.name);
        console.log('Error Message:', apiError.message);
        console.log('Error Details:', JSON.stringify(apiError, null, 2));

        // Try to extract more information if it's an OpenAI error
        if (apiError.status) {
          console.log('Status Code:', apiError.status);
        }
        if (apiError.headers) {
          console.log('Response Headers:', apiError.headers);
        }
        if (apiError.error) {
          console.log('Error Object:', apiError.error);
        }

        throw apiError;
      }
    } catch (error) {
      console.error('Error in processQuery:', error);
      return {
        message: `Sorry, I encountered an error processing your query: ${error.message}`,
      };
    }
  }

  // Helper method to enhance the response with table information
  private enhanceResponseWithTableInfo(
    message: string,
    sql: string,
    schemas: Record<string, any[]>,
  ): string {
    // Get the table names from the schemas
    const tableNames = Object.keys(schemas);

    // Create a description of available tables
    const tablesDescription = tableNames.join(', ');

    // Add information about available tables to the message
    return `${message}\n\nAvailable tables in the database: ${tablesDescription}`;
  }

  // Helper method to make a direct HTTPS request to see the raw response
  private makeDirectRequest(payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);

      const options = {
        hostname: 'api.aimlapi.com',
        port: 443,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.get<string>('OPENAI_API_KEY')}`,
          'Content-Length': Buffer.byteLength(data),
        },
      };

      console.log('=== DEBUG: Direct HTTPS Request ===');
      console.log('Request Options:', JSON.stringify(options, null, 2));

      const req = https.request(options, (res) => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));

        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          console.log('Response Body:', responseData);
          resolve();
        });
      });

      req.on('error', (error) => {
        console.error('Request Error:', error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async executeGeneratedQuery(sql: string): Promise<any> {
    // Execute the SQL query using Supabase
    const { data, error } = await this.supabaseService.supabase.rpc(
      'execute_query',
      { query: sql },
    );

    if (error) throw error;
    return data;
  }
}
