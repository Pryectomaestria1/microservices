import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors();

  // Asegurar que exista la carpeta de uploads en la raíz
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Servir archivos estáticos en /uploads/
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  await app.listen(3000);
  console.log('API Gateway running on http://localhost:3000/v1');
}
bootstrap();
