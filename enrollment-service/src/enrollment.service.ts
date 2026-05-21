import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as ms from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EnrollmentService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private catalogService: any;

  constructor(@Inject('CATALOG_SERVICE') private clientCatalog: ms.ClientGrpc) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.catalogService = this.clientCatalog.getService('CatalogService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enrollStudent(data: { courseId: string; userId: string }) {
    const info: any = await firstValueFrom(this.catalogService.GetCourseInfo({ courseId: data.courseId }));
    
    if (!info.exists) throw new Error('Course not found');

    try {
      // upsert garantiza idempotencia: si el registro ya existe (evento duplicado de RabbitMQ),
      // simplemente lo retorna sin crear uno nuevo ni lanzar un error fatal (ACK silencioso).
      return await this.enrollment.upsert({
        where: { userId_courseId: { userId: data.userId, courseId: data.courseId } },
        create: { courseId: data.courseId, userId: data.userId, amountPaid: info.price, progress: 0 },
        update: {}, // Si ya existe, no actualizamos nada
      });
    } catch (error: any) {
      // Captura de seguridad: código Prisma P2002 (Unique Constraint Failed)
      // ante race conditions extremas donde el upsert pudiera fallar antes de completarse.
      if (error?.code === 'P2002') {
        console.warn(`[enrollment-service] Evento duplicado ignorado silenciosamente: userId=${data.userId}, courseId=${data.courseId}`);
        return await this.enrollment.findUnique({
          where: { userId_courseId: { userId: data.userId, courseId: data.courseId } },
        });
      }
      throw error;
    }
  }

  async updateProgress(data: { enrollmentId: string; videoTimestamp: number; totalDuration: number }) {
    const progress = Math.min((data.videoTimestamp / data.totalDuration) * 100, 100);
    return this.enrollment.update({
      where: { id: data.enrollmentId },
      data: { progress },
    });
  }

  async markLessonCompleted(data: { enrollmentId: string; lessonId: string }) {
    const enrollment = await this.enrollment.findUnique({ where: { id: data.enrollmentId } });
    if (!enrollment) throw new Error('Enrollment not found');

    let newCompleted = enrollment.completedLessons;
    if (!newCompleted.includes(data.lessonId)) {
      newCompleted = [...newCompleted, data.lessonId];
    }

    // Recalculate progress based on total lessons from catalog
    let progress = 0;
    try {
      const courseDetails: any = await firstValueFrom(
        this.catalogService.GetCourseDetails({ courseId: enrollment.courseId })
      );
      const totalLessons = (courseDetails?.modules || []).reduce(
        (acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0
      );
      if (totalLessons > 0) {
        progress = Math.round((newCompleted.length / totalLessons) * 100);
      }
    } catch (e) {
      // If catalog call fails, estimate progress from completed count
      progress = newCompleted.length > 0 ? Math.min(newCompleted.length * 10, 100) : 0;
    }

    return this.enrollment.update({
      where: { id: data.enrollmentId },
      data: { completedLessons: newCompleted, progress },
    });
  }

  async getMyCourses(userId: string) {
    const enrollments = await this.enrollment.findMany({ where: { userId } });
    const courseIds = enrollments.map(e => e.courseId);

    if (courseIds.length === 0) return { enrollments: [] };

    const { courses }: any = await firstValueFrom(this.catalogService.GetCoursesByIds({ courseIds }));

    const composedData = enrollments.map(enrollment => {
      const courseDetails = courses.find((c: any) => c.id === enrollment.courseId);
      return {
        enrollmentId: enrollment.id,
        progress: enrollment.progress,
        courseId: courseDetails?.id,
        title: courseDetails?.title,
        instructorId: courseDetails?.instructorId,
        completedLessons: enrollment.completedLessons
      };
    });

    return { enrollments: composedData };
  }
}
