import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('v1')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('reviews')
  createReview(@Body() body: { courseId: string; rating: number; comment: string }, @Req() req: any) {
    // Simulamos que el userId viene del token JWT (como definimos en @httpBearerAuth)
    const userId = req.user?.sub || 'user-123';
    
    const review = this.reviewService.createReview(body.courseId, userId, body.rating, body.comment);
    return { review };
  }

  @Get('reviews/:id')
  getReview(@Param('id') id: string) {
    const review = this.reviewService.getReview(id);
    return { review };
  }

  @Put('reviews/:id')
  updateReview(@Param('id') id: string, @Body() body: { rating?: number; comment?: string }) {
    const review = this.reviewService.updateReview(id, body.rating, body.comment);
    return { review };
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    this.reviewService.deleteReview(id);
    return { success: true };
  }

  @Get('courses/:courseId/reviews')
  listCourseReviews(@Param('courseId') courseId: string) {
    const reviews = this.reviewService.listCourseReviews(courseId);
    return { reviews };
  }
}
