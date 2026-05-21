import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CatalogService } from './catalog.service';

@Controller()
export class AppController {
  constructor(private catalogService: CatalogService) {}

  @GrpcMethod('CatalogService', 'CreateCourse')
  async createCourse(data: any) {
    return await this.catalogService.createCourse(data);
  }

  @GrpcMethod('CatalogService', 'AddModuleToCourse')
  async addModuleToCourse(data: { courseId: string; title: string; description?: string; position: number }) {
    return await this.catalogService.addModuleToCourse(data);
  }

  @GrpcMethod('CatalogService', 'AddLessonToModule')
  async addLessonToModule(data: { moduleId: string; title: string; description?: string; position: number }) {
    return await this.catalogService.addLessonToModule(data);
  }

  @GrpcMethod('CatalogService', 'UpdateLessonVideo')
  async updateLessonVideo(data: { lessonId: string; videoUrl: string }) {
    return await this.catalogService.updateLessonVideo(data.lessonId, data.videoUrl);
  }

  @GrpcMethod('CatalogService', 'GetCoursesByIds')
  async getCoursesByIds(data: { courseIds: string[] }) {
    return await this.catalogService.getCoursesByIds(data.courseIds);
  }

  @GrpcMethod('CatalogService', 'GetCourseInfo')
  async getCourseInfo(data: { courseId: string }) {
    const course = await this.catalogService.getCourseInfo(data.courseId);
    return { exists: !!course, price: course?.price || 0 };
  }

  @GrpcMethod('CatalogService', 'ListCourses')
  async listCourses() {
    return await this.catalogService.listCourses();
  }

  @GrpcMethod('CatalogService', 'GetCourseDetails')
  async getCourseDetails(data: { courseId: string }) {
    const details = await this.catalogService.getCourseDetails(data.courseId);
    if (!details) {
      return { id: '', title: '', instructorId: '', price: 0, description: '', modules: [] };
    }
    return details;
  }

  @GrpcMethod('CatalogService', 'UpdateCourse')
  async updateCourse(data: { courseId: string; title: string; description: string }) {
    return await this.catalogService.updateCourse(data);
  }

  @GrpcMethod('CatalogService', 'UpdateModule')
  async updateModule(data: { moduleId: string; title: string; description: string }) {
    return await this.catalogService.updateModule(data);
  }

  @GrpcMethod('CatalogService', 'UpdateLesson')
  async updateLesson(data: { lessonId: string; title: string; description: string }) {
    return await this.catalogService.updateLesson(data);
  }

  @GrpcMethod('CatalogService', 'AddResourceToLesson')
  async addResourceToLesson(data: { lessonId: string; title: string; fileUrl: string; fileType: string }) {
    return await this.catalogService.addResourceToLesson(data);
  }

  @GrpcMethod('CatalogService', 'VerifyOwnership')
  async verifyOwnership(data: { userId: string; courseId?: string; moduleId?: string; lessonId?: string }) {
    return await this.catalogService.verifyOwnership(data);
  }
}
