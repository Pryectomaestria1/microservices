// Original file: src/proto/review.proto


export interface UpdateReviewRequest {
  'id'?: (string);
  'rating'?: (number);
  'comment'?: (string);
  '_rating'?: "rating";
  '_comment'?: "comment";
}

export interface UpdateReviewRequest__Output {
  'id': (string);
  'rating'?: (number);
  'comment'?: (string);
  '_rating'?: "rating";
  '_comment'?: "comment";
}
