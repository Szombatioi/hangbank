import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AiModelService } from './ai_model/ai_model.service';
import { LanguageService } from './language/language.service';
import { UserService } from './user/user.service';

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

  console.log("Seed admin")
  const userService = app.get(UserService);
  await userService.seedAdmin();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
