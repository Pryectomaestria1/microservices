import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
import { AppController } from './app.controller';
import { JwtStrategy } from './jwt.strategy';
import { OwnershipGuard } from './ownership.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(process.cwd(), '..', 'grpc-contracts', 'user.proto'),
          url: 'localhost:50051',
        },
      },
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'catalog',
          protoPath: join(process.cwd(), '..', 'grpc-contracts', 'catalog.proto'),
          url: 'localhost:50052',
        },
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(process.cwd(), '..', 'grpc-contracts', 'media.proto'),
          url: 'localhost:50053',
        },
      },
      {
        name: 'ENROLLMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'enrollment',
          protoPath: join(process.cwd(), '..', 'grpc-contracts', 'enrollment.proto'),
          url: 'localhost:50054',
        },
      },
      {
        name: 'SALES_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'sales',
          protoPath: join(process.cwd(), '..', 'grpc-contracts', 'sales.proto'),
          url: 'localhost:50055',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [JwtStrategy, OwnershipGuard],
})
export class AppModule {}
