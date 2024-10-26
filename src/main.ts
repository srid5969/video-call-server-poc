import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // enable cors
  app.enableCors();
  const configService = app.get(ConfigService<AppConfig>);
  const port = configService.get<string>('PORT');
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
