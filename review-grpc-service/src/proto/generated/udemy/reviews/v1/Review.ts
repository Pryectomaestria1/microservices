// Original file: src/proto/review.proto

import type { Timestamp as _google_protobuf_Timestamp, Timestamp__Output as _google_protobuf_Timestamp__Output } from '../../../google/protobuf/Timestamp';

export interface Review {
  'id'?: (string);
  'courseId'?: (string);
  'userId'?: (string);
  'rating'?: (number);
  'comment'?: (string);
  'createdAt'?: (_google_protobuf_Timestamp | null);
}

export interface Review__Output {
  'id': (string);
  'courseId': (string);
  'userId': (string);
  'rating': (number);
  'comment': (string);
  'createdAt': (_google_protobuf_Timestamp__Output | null);
}
