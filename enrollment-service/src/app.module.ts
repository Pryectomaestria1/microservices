import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';
import { EnrollmentService } from './enrollment.service';

const defaultProtoPath = join(process.cwd(), '..', 'grpc-contracts');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'catalog',
          protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'catalog.proto'),
          url: process.env.CATALOG_SERVICE_URL || 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [EnrollmentService],
})
export class AppModule {}
