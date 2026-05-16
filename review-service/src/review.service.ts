import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

@Injectable()
export class ReviewService {
  // Simularemos una base de datos en memoria para este microservicio
  private reviews: Review[] = [];

  createReview(courseId: string, userId: string, rating: number, comment: string): Review {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const newReview: Review = {
      id: uuidv4(),
      courseId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    this.reviews.push(newReview);
    return newReview;
  }

  getReview(id: string): Review {
    const review = this.reviews.find(r => r.id === id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  updateReview(id: string, rating?: number, comment?: string): Review {
    const reviewIndex = this.reviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const updatedReview = {
      ...this.reviews[reviewIndex],
      ...(rating && { rating }),
      ...(comment && { comment }),
    };

    this.reviews[reviewIndex] = updatedReview;
    return updatedReview;
  }

  deleteReview(id: string): void {
    const reviewIndex = this.reviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    this.reviews.splice(reviewIndex, 1);
  }

  listCourseReviews(courseId: string): Review[] {
    return this.reviews.filter(r => r.courseId === courseId);
  }
}
