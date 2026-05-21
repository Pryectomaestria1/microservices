import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ReviewService {
  private readonly DB_SERVICE_URL = 'http://localhost:3004/reviews';

  async createReview(data: any): Promise<any> {
    const response = await axios.post(this.DB_SERVICE_URL, {
      courseId: data.courseId,
      userId: 'user-grpc-multi-service',
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString()
    });
    return this.mapToProto(response.data);
  }

  async getReview(id: string): Promise<any> {
    try {
      const response = await axios.get(`${this.DB_SERVICE_URL}/${id}`);
      return this.mapToProto(response.data);
    } catch (error) {
      return null;
    }
  }

  async updateReview(id: string, rating?: number, comment?: string): Promise<any> {
    const update: any = {};
    if (rating) update.rating = rating;
    if (comment) update.comment = comment;
    
    const response = await axios.patch(`${this.DB_SERVICE_URL}/${id}`, update);
    return this.mapToProto(response.data);
  }

  async deleteReview(id: string): Promise<boolean> {
    await axios.delete(`${this.DB_SERVICE_URL}/${id}`);
    return true;
  }

  async listCourseReviews(courseId: string): Promise<any[]> {
    const response = await axios.get(`${this.DB_SERVICE_URL}?courseId=${courseId}`);
    return response.data.map((r: any) => this.mapToProto(r));
  }

  private mapToProto(item: any) {
    return {
      id: item.id.toString(),
      courseId: item.courseId,
      userId: item.userId,
      rating: item.rating,
      comment: item.comment,
      createdAt: { seconds: Math.floor(new Date(item.createdAt).getTime() / 1000), nanos: 0 },
    };
  }
}
