import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CatalogService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async createCourse(data: { title: string; instructorId: string; price: number; description: string; coverImage?: string }) {
    return this.course.create({ data });
  }

  async addModuleToCourse(data: { courseId: string; title: string; description?: string; position?: number }) {
    let position = data.position;
    if (position === undefined || position === null) {
      const count = await this.module.count({
        where: { courseId: data.courseId },
      });
      position = count + 1;
    }
    return this.module.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        position,
      },
    });
  }

  async addLessonToModule(data: { moduleId: string; title: string; description?: string; position?: number }) {
    let position = data.position;
    if (position === undefined || position === null) {
      const count = await this.lesson.count({
        where: { moduleId: data.moduleId },
      });
      position = count + 1;
    }
    return this.lesson.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        description: data.description,
        position,
      },
    });
  }

  async updateModule(data: { moduleId: string; title: string; description: string }) {
    return this.module.update({
      where: { id: data.moduleId },
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async updateLesson(data: { lessonId: string; title: string; description: string }) {
    return this.lesson.update({
      where: { id: data.lessonId },
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async updateLessonVideo(lessonId: string, videoUrl: string) {
    return this.lesson.update({
      where: { id: lessonId },
      data: { videoUrl, status: 'Ready' }, // Marcamos como Ready cuando ya se subió el video real
    });
  }

  async addResourceToLesson(data: { lessonId: string; title: string; fileUrl: string; fileType: string }) {
    return this.resource.create({ data });
  }

  async getCoursesByIds(courseIds: string[]) {
    const courses = await this.course.findMany({
      where: { id: { in: courseIds } },
    });
    return { courses };
  }
  
  async getCourseInfo(courseId: string) {
    return this.course.findUnique({ where: { id: courseId }});
  }

  async getCourseDetails(courseId: string) {
    return this.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                resources: true,
              },
            },
          },
        },
      },
    });
  }

  async listCourses() {
    const courses = await this.course.findMany();
    return { courses };
  }

  async updateCourse(data: { courseId: string; title: string; description: string; coverImage?: string }) {
    const updateData: any = {
      title: data.title,
      description: data.description,
    };
    if (data.coverImage) {
      updateData.coverImage = data.coverImage;
    }
    const updated = await this.course.update({
      where: { id: data.courseId },
      data: updateData,
      include: {
        modules: {
          include: {
            lessons: {
              include: { resources: true }
            }
          }
        }
      }
    });
    return updated;
  }
  async verifyOwnership(data: { userId: string; courseId?: string; moduleId?: string; lessonId?: string }): Promise<{ isOwner: boolean }> {
    let instructorId: string | null = null;

    if (data.courseId) {
      const course = await this.course.findUnique({ where: { id: data.courseId } });
      instructorId = course?.instructorId ?? null;
    } else if (data.moduleId) {
      const module = await this.module.findUnique({
        where: { id: data.moduleId },
        include: { course: true },
      });
      instructorId = module?.course?.instructorId ?? null;
    } else if (data.lessonId) {
      const lesson = await this.lesson.findUnique({
        where: { id: data.lessonId },
        include: { module: { include: { course: true } } },
      });
      instructorId = lesson?.module?.course?.instructorId ?? null;
    }

    return { isOwner: instructorId === data.userId };
  }
}
