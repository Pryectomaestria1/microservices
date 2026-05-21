import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Inject, 
  OnModuleInit, 
  Param, 
  UseGuards, 
  Req, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Put
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as ms from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { OwnershipGuard } from './ownership.guard';
import * as fs from 'fs';
import { join } from 'path';

@Controller()
export class AppController implements OnModuleInit {
  private authService: any;
  private catalogService: any;
  private mediaService: any;
  private enrollmentService: any;
  private salesService: any;

  constructor(
    @Inject('USER_SERVICE') private clientUser: ms.ClientGrpc,
    @Inject('CATALOG_SERVICE') private clientCatalog: ms.ClientGrpc,
    @Inject('MEDIA_SERVICE') private clientMedia: ms.ClientGrpc,
    @Inject('ENROLLMENT_SERVICE') private clientEnrollment: ms.ClientGrpc,
    @Inject('SALES_SERVICE') private clientSales: ms.ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.clientUser.getService('UserService');
    this.catalogService = this.clientCatalog.getService('CatalogService');
    this.mediaService = this.clientMedia.getService('MediaService');
    this.enrollmentService = this.clientEnrollment.getService('EnrollmentService');
    this.salesService = this.clientSales.getService('SalesService');
  }

  @UseGuards(AuthGuard)
  @Post('users/become-instructor')
  async becomeInstructor(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return await firstValueFrom(this.authService.BecomeInstructor({ token }));
  }

  @UseGuards(AuthGuard)
  @Post('users/profile')
  async syncProfile(@Body() data: { name: string; avatarUrl?: string }, @Req() req: any) {
    const userId = req.user?.userId;
    return await firstValueFrom(this.authService.SyncProfile({ 
      userId, 
      name: data.name, 
      avatarUrl: data.avatarUrl || '' 
    }));
  }

  @UseGuards(AuthGuard)
  @Post('courses')
  async createCourse(@Body() data: any, @Req() req: any) {
    const userId = req.user?.userId;
    return await firstValueFrom(this.catalogService.CreateCourse({ ...data, instructorId: userId }));
  }

  @Get('courses')
  async getCourses() {
    const response: any = await firstValueFrom(this.catalogService.ListCourses({}));
    const courses = response.courses || [];
    
    if (courses.length === 0) {
      return [];
    }

    const instructorIds = Array.from(
      new Set<string>(courses.map((c: any) => c.instructorId).filter(Boolean))
    );

    if (instructorIds.length === 0) {
      return courses.map((c: any) => ({ ...c, instructor: null }));
    }

    try {
      const authResponse: any = await firstValueFrom(
        this.authService.GetUsersByIds({ userIds: instructorIds })
      );
      const users = authResponse.users || [];
      const userMap = new Map(users.map((u: any) => [u.id, u]));

      return courses.map((course: any) => ({
        ...course,
        instructor: userMap.get(course.instructorId) || null,
      }));
    } catch (error) {
      return courses.map((course: any) => ({
        ...course,
        instructor: { id: course.instructorId, name: 'Usuario Demo', avatarUrl: '' }
      }));
    }
  }

  @Get('courses/:id')
  async getCourseDetails(@Param('id') id: string) {
    const course: any = await firstValueFrom(this.catalogService.GetCourseDetails({ courseId: id }));
    if (!course) return null;
    try {
      const authResponse: any = await firstValueFrom(
        this.authService.GetUsersByIds({ userIds: [course.instructorId] })
      );
      const user = authResponse.users?.[0] || null;
      return {
        ...course,
        instructor: user,
      };
    } catch (error) {
      return {
        ...course,
        instructor: { id: course.instructorId, name: 'Usuario Demo', avatarUrl: '' }
      };
    }
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Put('courses/:id')
  async updateCourse(@Param('id') id: string, @Body() data: any) {
    const payload: any = { courseId: id, title: data.title, description: data.description };
    if (data.coverImage) {
      payload.coverImage = data.coverImage;
    }
    return await firstValueFrom(this.catalogService.UpdateCourse(payload));
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Post('courses/:id/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCourseCover(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `cover-${id}-${Date.now()}.${fileExt}`;

    const uploadsDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filePath = join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const coverImage = `http://localhost:3000/uploads/${fileName}`;

    await firstValueFrom(this.catalogService.UpdateCourse({ courseId: id, coverImage }));

    return { success: true, coverImage };
  }

  @UseGuards(AuthGuard)
  @Post('sales/checkout')
  async checkout(
    @Body() data: { 
      userId: string; 
      courseIds: string[]; 
      amount: number; 
      cardNumber: string; 
      expiryDate: string; 
      cvv: string; 
      cardHolder: string;
    }
  ) {
    // 1. Procesar el pago simulado de todos los cursos en el carrito
    const paymentResult: any = await firstValueFrom(
      this.salesService.ProcessPayment({
        userId: data.userId,
        courseIds: data.courseIds,
        amount: data.amount,
        cardNumber: data.cardNumber,
        expiryDate: data.expiryDate,
        cvv: data.cvv,
        cardHolder: data.cardHolder,
      })
    );
    
    if (!paymentResult.success) {
      throw new BadRequestException(paymentResult.message);
    }

    // 2. Si el pago es exitoso, inscribir al estudiante en cada uno de los cursos
    const enrollments = data.courseIds.map(courseId => 
      firstValueFrom(this.enrollmentService.EnrollStudent({ userId: data.userId, courseId }))
    );
    await Promise.all(enrollments);

    return { success: true, message: 'Pago exitoso e inscripciones confirmadas en lote.' };
  }


  @UseGuards(AuthGuard, OwnershipGuard)
  @Post('courses/:id/modules')
  async addModule(@Param('id') courseId: string, @Body() data: { title: string; description?: string; position: number }) {
    return await firstValueFrom(this.catalogService.AddModuleToCourse({ courseId, title: data.title, description: data.description || '', position: data.position }));
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Post('modules/:moduleId/lessons')
  async addLesson(@Param('moduleId') moduleId: string, @Body() data: { title: string; description?: string; position: number }) {
    return await firstValueFrom(this.catalogService.AddLessonToModule({ moduleId, title: data.title, description: data.description || '', position: data.position }));
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Put('modules/:moduleId')
  async updateModule(@Param('moduleId') moduleId: string, @Body() data: { title: string; description: string }) {
    return await firstValueFrom(this.catalogService.UpdateModule({ moduleId, title: data.title, description: data.description }));
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Put('lessons/:lessonId')
  async updateLesson(@Param('lessonId') lessonId: string, @Body() data: { title: string; description: string }) {
    return await firstValueFrom(this.catalogService.UpdateLesson({ lessonId, title: data.title, description: data.description }));
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Post('lessons/:lessonId/video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: any
  ) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }
    
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${lessonId}-${Date.now()}.${fileExt}`;
    
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    
    const filePath = join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const videoUrl = `http://localhost:3000/uploads/${fileName}`;

    await firstValueFrom(this.catalogService.UpdateLessonVideo({ lessonId, videoUrl }));

    return { success: true, videoUrl };
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @Post('lessons/:lessonId/resources')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResource(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: any
  ) {
    if (!file) {
      throw new BadRequestException('No resource file uploaded');
    }

    const fileExt = file.originalname.split('.').pop() || '';
    const fileName = `resource-${lessonId}-${Date.now()}.${fileExt}`;
    
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    
    const filePath = join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `http://localhost:3000/uploads/${fileName}`;

    return await firstValueFrom(
      this.catalogService.AddResourceToLesson({
        lessonId,
        title: file.originalname,
        fileUrl,
        fileType: fileExt.toLowerCase()
      })
    );
  }

  @UseGuards(AuthGuard)
  @Post('media/upload-url')
  async getUploadUrl(@Body() data: any) {
    return await firstValueFrom(this.mediaService.GeneratePresignedUrl(data));
  }

  @UseGuards(AuthGuard)
  @Post('enrollments')
  async enroll(@Body() data: any) {
    return await firstValueFrom(this.enrollmentService.EnrollStudent(data));
  }

  @UseGuards(AuthGuard)
  @Get('enrollments/my-courses/:userId')
  async getMyCourses(@Param('userId') userId: string) {
    return await firstValueFrom(this.enrollmentService.GetMyCourses({ userId }));
  }

  @UseGuards(AuthGuard)
  @Post('enrollments/:enrollmentId/lessons/:lessonId/complete')
  async markLessonCompleted(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return await firstValueFrom(this.enrollmentService.MarkLessonCompleted({ enrollmentId, lessonId }));
  }
}
