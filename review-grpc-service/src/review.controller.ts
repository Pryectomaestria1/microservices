import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // --- ENDPOINTS REST PARA POSTMAN ---

  @Post()
  async create(@Body() data: { courseId: string; rating: number; comment: string }) {
    console.log('REST: Crear reseña');
    return await this.reviewService.createReview(data);
  }

  @Get()
  async findAll(@Query('courseId') courseId: string) {
    console.log('REST: Listar reseñas');
    return await this.reviewService.listCourseReviews(courseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log('REST: Obtener una reseña');
    return await this.reviewService.getReview(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: { rating?: number; comment?: string }) {
    console.log('REST: Actualizar reseña');
    return await this.reviewService.updateReview(id, data.rating, data.comment);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    console.log('REST: Eliminar reseña');
    const success = await this.reviewService.deleteReview(id);
    return { success };
  }

  // --- MÉTODOS gRPC (Para comunicación interna) ---

  @GrpcMethod('ReviewService', 'CreateReview')
  async createReview(data: any) {
    return await this.reviewService.createReview(data);
  }

  @GrpcMethod('ReviewService', 'GetReview')
  async getReview(data: { id: string }) {
    return await this.reviewService.getReview(data.id);
  }

  @GrpcMethod('ReviewService', 'UpdateReview')
  async updateReview(data: any) {
    return await this.reviewService.updateReview(data.id, data.rating, data.comment);
  }

  @GrpcMethod('ReviewService', 'DeleteReview')
  async deleteReview(data: { id: string }) {
    const success = await this.reviewService.deleteReview(data.id);
    return { success };
  }

  @GrpcMethod('ReviewService', 'ListCourseReviews')
  async listCourseReviews(data: { courseId: string }) {
    return await this.reviewService.listCourseReviews(data.courseId);
  }
}
