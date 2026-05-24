import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
import { AppController } from './app.controller';
import { JwtStrategy } from './jwt.strategy';
import { OwnershipGuard } from './ownership.guard';
import { RolesGuard } from './roles.guard';
import { ResolvedUserGuard } from './resolved-user.guard';

const defaultProtoPath = join(process.cwd(), '..', 'grpc-contracts');

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
          protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'user.proto'),
          url: process.env.USER_SERVICE_URL || 'localhost:50051',
        },
      },
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'catalog',
          protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'catalog.proto'),
          url: process.env.CATALOG_SERVICE_URL || 'localhost:50052',
        },
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'media.proto'),
          url: process.env.MEDIA_SERVICE_URL || 'localhost:50053',
        },
      },
      {
        name: 'ENROLLMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'enrollment',
          protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'enrollment.proto'),
          url: process.env.ENROLLMENT_SERVICE_URL || 'localhost:50054',
        },
      },
      {
        name: 'SALES_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'sales',
          protoPath: join(process.env.PROTO_PATH || defaultProtoPath, 'sales.proto'),
          url: process.env.SALES_SERVICE_URL || 'localhost:50055',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [JwtStrategy, OwnershipGuard, RolesGuard, ResolvedUserGuard],
})
export class AppModule {}
