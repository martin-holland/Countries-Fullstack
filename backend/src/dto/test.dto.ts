import { ApiProperty } from '@nestjs/swagger';

export class TestResponseDto {
  @ApiProperty({
    description: 'Connection status message',
    example: 'Connected to Supabase!',
  })
  status: string;

  @ApiProperty({
    description: 'Data returned from Supabase',
    example: [{ id: 1, name: 'Test Item' }],
  })
  data: any[];

  @ApiProperty({
    description: 'Timestamp of the request',
    example: '2024-03-19T10:30:00.000Z',
  })
  timestamp: string;
}
