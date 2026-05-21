import { Controller } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload } from '@nestjs/microservices';
import { EnrollmentService } from './enrollment.service';

@Controller()
export class AppController {
  constructor(private enrollmentService: EnrollmentService) {}

  @GrpcMethod('EnrollmentService', 'EnrollStudent')
  async enrollStudent(data: { courseId: string; userId: string }) {
    return await this.enrollmentService.enrollStudent(data);
  }

  @GrpcMethod('EnrollmentService', 'UpdateProgress')
  async updateProgress(data: { enrollmentId: string; videoTimestamp: number; totalDuration: number }) {
    return await this.enrollmentService.updateProgress(data);
  }

  @GrpcMethod('EnrollmentService', 'MarkLessonCompleted')
  async markLessonCompleted(data: { enrollmentId: string; lessonId: string }) {
    return await this.enrollmentService.markLessonCompleted(data);
  }

  @GrpcMethod('EnrollmentService', 'GetMyCourses')
  async getMyCourses(data: { userId: string }) {
    return await this.enrollmentService.getMyCourses(data.userId);
  }

  @EventPattern('course.purchased')
  async handleCoursePurchased(@Payload() data: { userId: string; courseId: string; transactionId: string }) {
    console.log('Event received: course.purchased', data);
    // Realizamos la inscripción de manera asíncrona
    await this.enrollmentService.enrollStudent({ courseId: data.courseId, userId: data.userId });
  }
}
