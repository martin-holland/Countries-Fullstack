import { ApiProperty } from '@nestjs/swagger';

class TestItem {
  @ApiProperty({
    description: 'Unique identifier',
    example: '00e8be51-d20f-4fd7-b128-cd8eabe8f570',
  })
  id: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-10T02:04:25.298293+00:00',
  })
  created_at: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Test Item 1',
  })
  name: string;

  @ApiProperty({
    description: 'Item description',
    example: 'This is the first test item',
  })
  description: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  is_active: boolean;
}

export class TestResponseDto {
  @ApiProperty({
    description: 'Connection status message',
    example: 'Connected to Supabase!',
  })
  status: string;

  @ApiProperty({
    description: 'Data returned from Supabase',
    type: [TestItem],
    example: [
      {
        id: '00e8be51-d20f-4fd7-b128-cd8eabe8f570',
        created_at: '2025-01-10T02:04:25.298293+00:00',
        name: 'Test Item 1',
        description: 'This is the first test item',
        is_active: true,
      },
      {
        id: '374310e9-3baf-4902-9e29-7a37742a4c75',
        created_at: '2025-01-10T02:04:25.298293+00:00',
        name: 'Test Item 2',
        description: 'This is the second test item',
        is_active: true,
      },
    ],
    required: false,
  })
  data?: TestItem[];

  @ApiProperty({
    description: 'Error message if connection fails',
    example: 'Failed to connect to database',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Timestamp of the request',
    example: '2025-02-21T00:57:48.098Z',
  })
  timestamp: string;
}
