import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AiModelService } from './ai_model/ai_model.service';
import { LanguageService } from './language/language.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js dev server
    credentials: true,
  });

  console.log("Seeding AI Models on startup...");
  const aiModelService = app.get(AiModelService);
  await aiModelService.seedAIModels();

  console.log("Seeding Languages on startup...");
  const languageService = app.get(LanguageService);
  await languageService.seedLanguages();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
