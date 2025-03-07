import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './controllers/ai.controller';
import { AppController } from './controllers/app.controller';
import { TestController } from './controllers/test.controller';
import { AiQueryService } from './services/ai.service';
import { AppService } from './services/app.service';
import { SupabaseService } from './services/supabase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Add any environment validation here if needed
    }),
  ],
  controllers: [AppController, TestController, AiController],
  providers: [AppService, SupabaseService, AiQueryService],
})
export class AppModule {}
