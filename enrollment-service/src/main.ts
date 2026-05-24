import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

const defaultProtoPath = join(process.cwd(), '..', 'grpc-contracts');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'enrollment',
      protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'enrollment.proto'),
      url: '0.0.0.0:50054',
    },
  });

  // RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'sales_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3004); // Or any unused port for the hybrid app
  console.log('Enrollment Service listening (gRPC 50054 & RMQ sales_queue)');
}
bootstrap();
