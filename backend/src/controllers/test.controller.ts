import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestResponseDto } from '../dto/test.dto';
import { SupabaseService } from '../services/supabase.service';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('supabase')
  @ApiOperation({ summary: 'Test Supabase connection' })
  @ApiResponse({
    status: 200,
    description: 'Returns test data successfully',
    type: TestResponseDto,
  })
  async testConnection(): Promise<TestResponseDto> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('test')
        .select('*')
        .limit(50);

      if (error) throw error;
      return {
        status: 'Connected to Supabase!',
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'Connection failed',
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
