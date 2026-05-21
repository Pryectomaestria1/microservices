import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { Timestamp as _google_protobuf_Timestamp, Timestamp__Output as _google_protobuf_Timestamp__Output } from './google/protobuf/Timestamp';
import type { CreateReviewRequest as _udemy_reviews_v1_CreateReviewRequest, CreateReviewRequest__Output as _udemy_reviews_v1_CreateReviewRequest__Output } from './udemy/reviews/v1/CreateReviewRequest';
import type { DeleteReviewRequest as _udemy_reviews_v1_DeleteReviewRequest, DeleteReviewRequest__Output as _udemy_reviews_v1_DeleteReviewRequest__Output } from './udemy/reviews/v1/DeleteReviewRequest';
import type { DeleteReviewResponse as _udemy_reviews_v1_DeleteReviewResponse, DeleteReviewResponse__Output as _udemy_reviews_v1_DeleteReviewResponse__Output } from './udemy/reviews/v1/DeleteReviewResponse';
import type { GetReviewRequest as _udemy_reviews_v1_GetReviewRequest, GetReviewRequest__Output as _udemy_reviews_v1_GetReviewRequest__Output } from './udemy/reviews/v1/GetReviewRequest';
import type { ListCourseReviewsRequest as _udemy_reviews_v1_ListCourseReviewsRequest, ListCourseReviewsRequest__Output as _udemy_reviews_v1_ListCourseReviewsRequest__Output } from './udemy/reviews/v1/ListCourseReviewsRequest';
import type { ListCourseReviewsResponse as _udemy_reviews_v1_ListCourseReviewsResponse, ListCourseReviewsResponse__Output as _udemy_reviews_v1_ListCourseReviewsResponse__Output } from './udemy/reviews/v1/ListCourseReviewsResponse';
import type { Review as _udemy_reviews_v1_Review, Review__Output as _udemy_reviews_v1_Review__Output } from './udemy/reviews/v1/Review';
import type { ReviewResponse as _udemy_reviews_v1_ReviewResponse, ReviewResponse__Output as _udemy_reviews_v1_ReviewResponse__Output } from './udemy/reviews/v1/ReviewResponse';
import type { ReviewServiceClient as _udemy_reviews_v1_ReviewServiceClient, ReviewServiceDefinition as _udemy_reviews_v1_ReviewServiceDefinition } from './udemy/reviews/v1/ReviewService';
import type { UpdateReviewRequest as _udemy_reviews_v1_UpdateReviewRequest, UpdateReviewRequest__Output as _udemy_reviews_v1_UpdateReviewRequest__Output } from './udemy/reviews/v1/UpdateReviewRequest';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  google: {
    protobuf: {
      Timestamp: MessageTypeDefinition<_google_protobuf_Timestamp, _google_protobuf_Timestamp__Output>
    }
  }
  udemy: {
    reviews: {
      v1: {
        CreateReviewRequest: MessageTypeDefinition<_udemy_reviews_v1_CreateReviewRequest, _udemy_reviews_v1_CreateReviewRequest__Output>
        DeleteReviewRequest: MessageTypeDefinition<_udemy_reviews_v1_DeleteReviewRequest, _udemy_reviews_v1_DeleteReviewRequest__Output>
        DeleteReviewResponse: MessageTypeDefinition<_udemy_reviews_v1_DeleteReviewResponse, _udemy_reviews_v1_DeleteReviewResponse__Output>
        GetReviewRequest: MessageTypeDefinition<_udemy_reviews_v1_GetReviewRequest, _udemy_reviews_v1_GetReviewRequest__Output>
        ListCourseReviewsRequest: MessageTypeDefinition<_udemy_reviews_v1_ListCourseReviewsRequest, _udemy_reviews_v1_ListCourseReviewsRequest__Output>
        ListCourseReviewsResponse: MessageTypeDefinition<_udemy_reviews_v1_ListCourseReviewsResponse, _udemy_reviews_v1_ListCourseReviewsResponse__Output>
        Review: MessageTypeDefinition<_udemy_reviews_v1_Review, _udemy_reviews_v1_Review__Output>
        ReviewResponse: MessageTypeDefinition<_udemy_reviews_v1_ReviewResponse, _udemy_reviews_v1_ReviewResponse__Output>
        ReviewService: SubtypeConstructor<typeof grpc.Client, _udemy_reviews_v1_ReviewServiceClient> & { service: _udemy_reviews_v1_ReviewServiceDefinition }
        UpdateReviewRequest: MessageTypeDefinition<_udemy_reviews_v1_UpdateReviewRequest, _udemy_reviews_v1_UpdateReviewRequest__Output>
      }
    }
  }
}

