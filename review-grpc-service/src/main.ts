import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Establecemos el prefijo global de versión para seguir buenas prácticas
  app.setGlobalPrefix('v1');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'udemy.reviews.v1',
      protoPath: join(__dirname, './proto/review.proto'),
      url: '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  
  console.log('🚀 Microservicio gRPC + REST v1 listo:');
  console.log('- gRPC en el puerto 50051');
  console.log('- REST en http://localhost:3000/v1/reviews');
}
bootstrap();
