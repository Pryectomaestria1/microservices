import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

const defaultProtoPath = join(process.cwd(), '..', 'grpc-contracts');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'media',
      protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'media.proto'),
      url: '0.0.0.0:50053',
    },
  });
  await app.listen();
  console.log('Media gRPC Service listening on 50053');
}
bootstrap();
