import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [CatalogService],
})
export class AppModule {}
