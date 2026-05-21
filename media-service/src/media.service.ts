import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import * as ms from '@nestjs/microservices';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaService implements OnModuleInit {
  private s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.AWS_S3_ENDPOINT || 'http://localhost:9000',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'admin',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'password123',
    },
    forcePathStyle: true,
  });
  private catalogService: any;

  constructor(@Inject('CATALOG_SERVICE') private clientCatalog: ms.ClientGrpc) {}

  onModuleInit() {
    this.catalogService = this.clientCatalog.getService('CatalogService');
  }

  async generatePresignedUrl(fileName: string, lessonId: string) {
    const key = `raw-videos/${lessonId}/${fileName}`;
    const command = new PutObjectCommand({ Bucket: 'udemy-media', Key: key });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return { uploadUrl: url, key };
  }

  async confirmVideoUpload(lessonId: string, key: string) {
    const hlsUrl = `https://cdn.udemyclone.com/${key.replace('raw-videos', 'hls')}/index.m3u8`;
    await firstValueFrom(this.catalogService.UpdateLessonVideo({ lessonId, videoUrl: hlsUrl }));
    return { status: 'Processing started', hlsUrl };
  }
}
