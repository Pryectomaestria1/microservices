import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const defaultProtoPath = join(process.cwd(), '..', 'grpc-contracts');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'sales',
      protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'sales.proto'),
      url: '0.0.0.0:50055',
    },
  });
  await app.listen();
  console.log('Sales Microservice is listening on port 50055');
}
bootstrap();
