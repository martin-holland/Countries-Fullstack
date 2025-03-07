import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { AiQueryService } from '../services/ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiQueryService: AiQueryService) {}

  @Post('query')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Process a natural language query' })
  @ApiResponse({
    status: 200,
    description: 'Returns the processed query result',
  })
  async processQuery(@Body() body: { query: string }) {
    try {
      const result = await this.aiQueryService.processQuery(body.query);

      if (result.sql) {
        try {
          const queryResult = await this.aiQueryService.executeGeneratedQuery(
            result.sql,
          );
          return {
            message: result.message,
            sql: result.sql,
            data: queryResult,
          };
        } catch (error) {
          console.error('Error executing query:', error);
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
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        message: 'Sorry, I encountered an error processing your query.',
        error: error.message,
      };
    }
  }

  @Get('tables')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get database table schemas' })
  @ApiResponse({
    status: 200,
    description: 'Returns the database table schemas',
  })
  async getTableSchemas() {
    try {
      return await this.aiQueryService.getTableSchemas();
    } catch (error) {
      console.error('Error fetching table schemas:', error);
      return {
        error: 'Failed to fetch table schemas',
        message: error.message,
      };
    }
  }
}
