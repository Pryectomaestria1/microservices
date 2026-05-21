import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MediaService } from './media.service';

@Controller()
export class AppController {
  constructor(private mediaService: MediaService) {}

  @GrpcMethod('MediaService', 'GeneratePresignedUrl')
  async generatePresignedUrl(data: { fileName: string; lessonId: string }) {
    return await this.mediaService.generatePresignedUrl(data.fileName, data.lessonId);
  }

  @GrpcMethod('MediaService', 'ConfirmVideoUpload')
  async confirmVideoUpload(data: { lessonId: string; key: string }) {
    return await this.mediaService.confirmVideoUpload(data.lessonId, data.key);
  }
}
