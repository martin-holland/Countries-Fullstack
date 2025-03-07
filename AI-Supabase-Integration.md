# AI-Supabase Integration

This document outlines the implementation of an AI-powered database query assistant that allows users to interact with the application's Supabase database using natural language. The feature translates user questions into SQL queries and returns formatted results.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Security Considerations](#security-considerations)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

## Overview

The AI-Supabase integration feature allows users to:

- Ask questions about country data in natural language
- Get direct answers or view the results of automatically generated SQL queries
- Explore database information without knowing SQL

The system works by:

1. Extracting database schema information from Supabase
2. Sending this schema along with the user's query to an AI model
3. Processing the AI's response to extract SQL queries if present
4. Executing valid queries against the database
5. Returning both the natural language explanation and query results to the user

## Prerequisites

### Required Packages

For the backend (NestJS):

```bash
npm install @supabase/supabase-js openai
```

For the frontend (React):

```bash
npm install @mui/material @mui/icons-material
```

### API Keys

You'll need:

- OpenAI API key (for GPT model access)
- Supabase credentials (already configured in your application)
- Recommended to use: AI/ML API (Free tiers availavble)

Add the OpenAI API key to your environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Database Setup

### 1. Create Schema Information Function

Run this SQL in your Supabase SQL Editor to create a function that returns table schema information:

```sql
CREATE OR REPLACE FUNCTION get_table_schema(p_table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text, column_default text) AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name, c.data_type, c.is_nullable, c.column_default
    FROM information_schema.columns c
    WHERE c.table_name = p_table_name
    AND c.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;
```

### 2. Create Query Execution Function

This function will safely execute the AI-generated queries:

```sql
CREATE OR REPLACE FUNCTION execute_query(query text)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    EXECUTE 'WITH query_result AS (' || query || ') SELECT jsonb_agg(row_to_json(query_result)) FROM query_result' INTO result;
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Query execution failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Set Up User Profiles View and RLS Policies

To allow the AI service to access user information safely, create a view and appropriate policies:

```sql
-- Create a view for limited user information with security_invoker option
CREATE VIEW public.user_profiles
WITH (security_invoker = on) AS
SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    EXTRACT(DAY FROM NOW() - created_at)::integer as account_age_days
FROM auth.users;

-- Enable RLS on the auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access their profiles
CREATE POLICY "Authenticated Users Can Access Their Profiles"
ON auth.users
FOR SELECT
TO authenticated
USING (true);
```

The `security_invoker = on` option ensures that the view respects the RLS policies of the underlying tables, providing an additional layer of security.

## Backend Implementation

### 1. Create AI Service

Create a new file `src/services/ai.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { OpenAI } from "openai";

@Injectable()
export class AiQueryService {
  private openai: OpenAI;

  constructor(private supabaseService: SupabaseService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getTableSchemas(): Promise<Record<string, any[]>> {
    // Get list of tables
    const { data: tables, error: tablesError } =
      await this.supabaseService.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public");

    if (tablesError) throw tablesError;

    // Get schema for each table
    const schemas: Record<string, any[]> = {};
    for (const table of tables) {
      const { data: schema, error: schemaError } =
        await this.supabaseService.supabase.rpc("get_table_schema", {
          p_table_name: table.table_name,
        });

      if (schemaError) throw schemaError;
      schemas[table.table_name] = schema;
    }

    return schemas;
  }

  async processQuery(
    userQuery: string
  ): Promise<{ sql?: string; message: string }> {
    // Get all table schemas
    const schemas = await this.getTableSchemas();

    // Prepare system prompt with schema information
    const systemPrompt = `
      You are a database assistant for a Countries application. 
      You have access to the following tables in the database:
      
      ${Object.entries(schemas)
        .map(
          ([tableName, columns]) => `
        Table: ${tableName}
        Columns: ${columns
          .map(
            (col) =>
              `${col.column_name} (${col.data_type}, ${
                col.is_nullable === "YES" ? "nullable" : "not nullable"
              })`
          )
          .join(", ")}
      `
        )
        .join("\n")}
      
      If the user's query can be answered with a SQL query, respond with the PostgreSQL query wrapped in <POSTGRES> tags.
      If the query requires explanation or cannot be answered with SQL, provide a helpful response in natural language.
      Always prioritize security - do not generate queries that could be harmful or expose sensitive data.
      
      For user-related queries, use the user_profiles view instead of directly accessing auth.users.
      
      Examples:
      1. "Show me countries in Europe" -> <POSTGRES>SELECT * FROM countries WHERE region = 'Europe'</POSTGRES>
      2. "How many users have favorites?" -> <POSTGRES>SELECT COUNT(DISTINCT user_id) FROM country_favorites</POSTGRES>
      3. "What is the most popular country?" -> <POSTGRES>SELECT country_name, COUNT(*) as favorite_count FROM country_favorites GROUP BY country_name ORDER BY favorite_count DESC LIMIT 1</POSTGRES>
    `;

    // Call OpenAI API
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: 0.3,
    });

    const aiResponse = response.choices[0].message.content;

    // Extract SQL if present
    const sqlMatch = aiResponse.match(/<POSTGRES>([\s\S]*?)<\/POSTGRES>/);
    const sql = sqlMatch ? sqlMatch[1].trim() : undefined;

    // Extract message (everything outside the POSTGRES tags)
    let message = aiResponse
      .replace(/<POSTGRES>[\s\S]*?<\/POSTGRES>/, "")
      .trim();
    if (!message && sql) {
      message = "I've generated a SQL query based on your request.";
    }

    return { sql, message };
  }

  async executeGeneratedQuery(sql: string): Promise<any> {
    // Execute the SQL query using Supabase
    const { data, error } = await this.supabaseService.supabase.rpc(
      "execute_query",
      { query: sql }
    );

    if (error) throw error;
    return data;
  }
}
```

### 2. Create AI Controller

Create a new file `src/controllers/ai.controller.ts`:

```typescript
import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import { AiQueryService } from "../services/ai.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("ai")
export class AiController {
  constructor(private aiQueryService: AiQueryService) {}

  @Post("query")
  @UseGuards(AuthGuard)
  async processQuery(@Body() body: { query: string }) {
    const result = await this.aiQueryService.processQuery(body.query);

    if (result.sql) {
      try {
        const queryResult = await this.aiQueryService.executeGeneratedQuery(
          result.sql
        );
        return {
          message: result.message,
          sql: result.sql,
          data: queryResult,
        };
      } catch (error) {
        return {
          message: `I generated a query, but it couldn't be executed: ${error.message}`,
          sql: result.sql,
          error: error.message,
        };
      }
    }

    return {
      message: result.message,
    };
  }

  @Get("tables")
  @UseGuards(AuthGuard)
  async getTableSchemas() {
    return await this.aiQueryService.getTableSchemas();
  }
}
```

### 3. Update App Module

Update `src/app.module.ts` to include the new service and controller:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SupabaseService } from "./services/supabase.service";
import { AiQueryService } from "./services/ai.service";
import { AiController } from "./controllers/ai.controller";

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AiController],
  providers: [AppService, SupabaseService, AiQueryService],
})
export class AppModule {}
```

## Frontend Implementation

### Create AI Query Assistant Component

Create a new file `frontend/src/components/AI/AiQueryAssistant.tsx`:

```tsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DynamicTable } from "../DynamicTable"; // Reusing your existing table component
import { useAuth } from "../../context/AuthContext";

export const AiQueryAssistant = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message?: string;
    sql?: string;
    data?: any[];
    error?: string;
  } | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setLoading(true);

    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: "Failed to process your query. Please try again.",
      });
      console.error("AI query error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Please log in to use the AI Query Assistant
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        AI Database Assistant
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Ask questions about countries or request specific data in natural
        language. The AI will generate SQL queries or provide answers directly.
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          label="Ask a question about countries data"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          rows={2}
          placeholder="Example: Show me the top 5 countries by population in Europe"
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !query.trim()}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? "Processing..." : "Ask AI Assistant"}
        </Button>
      </Paper>

      {result && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>
            <Typography variant="body1" paragraph>
              {result.message || "No message provided."}
            </Typography>

            {result.error && (
              <Typography color="error" variant="body2">
                Error: {result.error}
              </Typography>
            )}
          </Paper>

          {result.sql && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Generated SQL Query</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "grey.900",
                    color: "grey.100",
                    fontFamily: "monospace",
                    overflowX: "auto",
                  }}
                >
                  <pre>{result.sql}</pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}

          {result.data && result.data.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Query Results
              </Typography>
              <DynamicTable data={result.data} />
            </Box>
          )}

          {result.data && result.data.length === 0 && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body1">
                  The query executed successfully but returned no results.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Example Questions
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                Which countries in Asia have a population over 100 million?
              </li>
              <li>What are the 5 smallest countries by area?</li>
              <li>How many users have saved Switzerland as a favorite?</li>
              <li>Which country has the most favorites?</li>
              <li>Show me all countries that use Euro as their currency</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
```

### Update App.tsx

Add the AI Query Assistant route to your App.tsx:

```tsx
// Add import
import { AiQueryAssistant } from "./components/AI/AiQueryAssistant";

// Add route inside the Routes component
<Route
  path="/ai-assistant"
  element={
    <ProtectedRoute>
      <AiQueryAssistant />
    </ProtectedRoute>
  }
/>;
```

### Update Navigation.tsx

Add a link to the AI Assistant in your Navigation component:

```tsx
// Add import
import SmartToyIcon from "@mui/icons-material/SmartToy";

// Add button inside the navigation bar
{
  user && (
    <Button
      color="inherit"
      component={RouterLink}
      to="/ai-assistant"
      startIcon={<SmartToyIcon />}
    >
      AI Assistant
    </Button>
  );
}
```

## Security Considerations

### 1. Row Level Security (RLS)

The implementation uses RLS policies to ensure:

- Users can access data through the user_profiles view
- The auth.users table is protected with RLS
- The security_invoker option ensures the view respects underlying table permissions

### 2. Query Validation

The `execute_query` function:

- Runs with `SECURITY DEFINER` to execute with the permissions of the function creator
- Wraps user queries in a CTE to prevent multiple statement execution
- Returns errors rather than exposing database details

### 3. AI Prompt Engineering

The system prompt:

- Explicitly instructs the AI to prioritize security
- Provides examples of safe queries
- Directs the AI to use the user_profiles view instead of auth.users

### 4. Rate Limiting

Consider implementing rate limiting to prevent abuse:

```typescript
// Simple in-memory rate limiting (add to AiController)
private userQueries = new Map<string, { count: number, resetTime: number }>();

private checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = 10; // 10 queries per minute
  const resetInterval = 60 * 1000; // 1 minute

  const userRate = this.userQueries.get(userId) || { count: 0, resetTime: now + resetInterval };

  if (now > userRate.resetTime) {
    userRate.count = 1;
    userRate.resetTime = now + resetInterval;
  } else {
    userRate.count += 1;
  }

  this.userQueries.set(userId, userRate);
  return userRate.count <= limit;
}
```

## Usage Examples

Here are some example queries users can ask:

1. **Basic country information**

   - "Show me all countries in South America"
   - "Which countries have a population over 100 million?"

2. **Aggregation and statistics**

   - "What is the average population of countries in Europe?"
   - "Which region has the most countries?"

3. **User-related queries**

   - "How many users have added favorites?"
   - "What's the most popular country in favorites?"

4. **Complex queries**
   - "Show me countries that are in Europe and use Euro as currency"
   - "Which countries have 'stan' in their name and are in Asia?"

## Troubleshooting

### Common Issues

1. **OpenAI API errors**

   - Check your API key is valid and has sufficient credits
   - Verify network connectivity to OpenAI services

2. **SQL execution errors**

   - Review the generated SQL for syntax errors
   - Check that the execute_query function has proper permissions

3. **Empty results**
   - The query may be valid but no data matches the criteria
   - Check the database has the expected data

### Debugging

1. **Backend logs**

   - Check NestJS logs for API call details and errors
   - Monitor Supabase logs for SQL execution issues

2. **Frontend debugging**

   - Use browser developer tools to inspect network requests
   - Check console for JavaScript errors

3. **AI response issues**
   - If the AI generates invalid SQL, try rephrasing the question
   - For complex queries, try breaking them into simpler parts

---

This documentation provides a comprehensive guide to implementing and using the AI-Supabase integration. For further assistance, refer to the OpenAI and Supabase documentation or contact the development team.
