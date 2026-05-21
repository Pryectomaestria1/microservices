// Original file: src/proto/review.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateReviewRequest as _udemy_reviews_v1_CreateReviewRequest, CreateReviewRequest__Output as _udemy_reviews_v1_CreateReviewRequest__Output } from '../../../udemy/reviews/v1/CreateReviewRequest';
import type { DeleteReviewRequest as _udemy_reviews_v1_DeleteReviewRequest, DeleteReviewRequest__Output as _udemy_reviews_v1_DeleteReviewRequest__Output } from '../../../udemy/reviews/v1/DeleteReviewRequest';
import type { GetReviewRequest as _udemy_reviews_v1_GetReviewRequest, GetReviewRequest__Output as _udemy_reviews_v1_GetReviewRequest__Output } from '../../../udemy/reviews/v1/GetReviewRequest';
import type { ListCourseReviewsRequest as _udemy_reviews_v1_ListCourseReviewsRequest, ListCourseReviewsRequest__Output as _udemy_reviews_v1_ListCourseReviewsRequest__Output } from '../../../udemy/reviews/v1/ListCourseReviewsRequest';
import type { ListCourseReviewsResponse as _udemy_reviews_v1_ListCourseReviewsResponse, ListCourseReviewsResponse__Output as _udemy_reviews_v1_ListCourseReviewsResponse__Output } from '../../../udemy/reviews/v1/ListCourseReviewsResponse';
import type { ReviewResponse as _udemy_reviews_v1_ReviewResponse, ReviewResponse__Output as _udemy_reviews_v1_ReviewResponse__Output } from '../../../udemy/reviews/v1/ReviewResponse';
import type { UpdateReviewRequest as _udemy_reviews_v1_UpdateReviewRequest, UpdateReviewRequest__Output as _udemy_reviews_v1_UpdateReviewRequest__Output } from '../../../udemy/reviews/v1/UpdateReviewRequest';

export interface ReviewServiceClient extends grpc.Client {
  CreateReview(argument: _udemy_reviews_v1_CreateReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  CreateReview(argument: _udemy_reviews_v1_CreateReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  CreateReview(argument: _udemy_reviews_v1_CreateReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  CreateReview(argument: _udemy_reviews_v1_CreateReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  createReview(argument: _udemy_reviews_v1_CreateReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  createReview(argument: _udemy_reviews_v1_CreateReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  createReview(argument: _udemy_reviews_v1_CreateReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  createReview(argument: _udemy_reviews_v1_CreateReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  
  DeleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  DeleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  DeleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  DeleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  deleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  deleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  deleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  deleteReview(argument: _udemy_reviews_v1_DeleteReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  
  GetReview(argument: _udemy_reviews_v1_GetReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  GetReview(argument: _udemy_reviews_v1_GetReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  GetReview(argument: _udemy_reviews_v1_GetReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  GetReview(argument: _udemy_reviews_v1_GetReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  getReview(argument: _udemy_reviews_v1_GetReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  getReview(argument: _udemy_reviews_v1_GetReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  getReview(argument: _udemy_reviews_v1_GetReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  getReview(argument: _udemy_reviews_v1_GetReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  
  ListCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  ListCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  ListCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  ListCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  listCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  listCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  listCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  listCourseReviews(argument: _udemy_reviews_v1_ListCourseReviewsRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ListCourseReviewsResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  UpdateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  UpdateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  UpdateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  updateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  updateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  updateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  updateReview(argument: _udemy_reviews_v1_UpdateReviewRequest, callback: grpc.requestCallback<_udemy_reviews_v1_ReviewResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface ReviewServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateReview: grpc.handleUnaryCall<_udemy_reviews_v1_CreateReviewRequest__Output, _udemy_reviews_v1_ReviewResponse>;
  
  DeleteReview: grpc.handleUnaryCall<_udemy_reviews_v1_DeleteReviewRequest__Output, _udemy_reviews_v1_ReviewResponse>;
  
  GetReview: grpc.handleUnaryCall<_udemy_reviews_v1_GetReviewRequest__Output, _udemy_reviews_v1_ReviewResponse>;
  
  ListCourseReviews: grpc.handleUnaryCall<_udemy_reviews_v1_ListCourseReviewsRequest__Output, _udemy_reviews_v1_ListCourseReviewsResponse>;
  
  UpdateReview: grpc.handleUnaryCall<_udemy_reviews_v1_UpdateReviewRequest__Output, _udemy_reviews_v1_ReviewResponse>;
  
}

export interface ReviewServiceDefinition extends grpc.ServiceDefinition {
  CreateReview: MethodDefinition<_udemy_reviews_v1_CreateReviewRequest, _udemy_reviews_v1_ReviewResponse, _udemy_reviews_v1_CreateReviewRequest__Output, _udemy_reviews_v1_ReviewResponse__Output>
  DeleteReview: MethodDefinition<_udemy_reviews_v1_DeleteReviewRequest, _udemy_reviews_v1_ReviewResponse, _udemy_reviews_v1_DeleteReviewRequest__Output, _udemy_reviews_v1_ReviewResponse__Output>
  GetReview: MethodDefinition<_udemy_reviews_v1_GetReviewRequest, _udemy_reviews_v1_ReviewResponse, _udemy_reviews_v1_GetReviewRequest__Output, _udemy_reviews_v1_ReviewResponse__Output>
  ListCourseReviews: MethodDefinition<_udemy_reviews_v1_ListCourseReviewsRequest, _udemy_reviews_v1_ListCourseReviewsResponse, _udemy_reviews_v1_ListCourseReviewsRequest__Output, _udemy_reviews_v1_ListCourseReviewsResponse__Output>
  UpdateReview: MethodDefinition<_udemy_reviews_v1_UpdateReviewRequest, _udemy_reviews_v1_ReviewResponse, _udemy_reviews_v1_UpdateReviewRequest__Output, _udemy_reviews_v1_ReviewResponse__Output>
}
