import { Module } from '@nestjs/common';
import { AiModelService } from './ai_model.service';
import { AiModelController } from './ai_model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModel } from './entities/ai_model.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiModel]),
  ],
  controllers: [AiModelController],
  providers: [AiModelService],
  exports: [AiModelService],
})
export class AiModelModule {}
