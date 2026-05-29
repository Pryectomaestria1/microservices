// Auto-generated from .proto files. Do not edit manually.
import { Observable } from 'rxjs';

// =========================================
// Namespace: Catalog
// =========================================

export interface ListCoursesRequest {
}

export interface ListCoursesResponse {
  courses?: Course[];
}

export interface Course {
  id?: string;
  title?: string;
  instructorId?: string;
  price?: number;
  description?: string;
  coverImage?: string;
}

export interface Module {
  id?: string;
  courseId?: string;
  title?: string;
  description?: string;
  position?: number;
}

export interface Lesson {
  id?: string;
  moduleId?: string;
  title?: string;
  videoUrl?: string;
  status?: string;
  resources?: Resource[];
  description?: string;
  position?: number;
}

export interface Resource {
  id?: string;
  lessonId?: string;
  title?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface CreateCourseRequest {
  title?: string;
  instructorId?: string;
  price?: number;
  description?: string;
  coverImage?: string;
}

export interface AddModuleRequest {
  courseId?: string;
  title?: string;
  description?: string;
  position?: number;
}

export interface AddLessonRequest {
  moduleId?: string;
  title?: string;
  description?: string;
  position?: number;
}

export interface UpdateLessonVideoRequest {
  lessonId?: string;
  videoUrl?: string;
}

export interface GetCoursesByIdsRequest {
  courseIds?: string[];
}

export interface GetCoursesByIdsResponse {
  courses?: Course[];
}

export interface GetCourseInfoRequest {
  courseId?: string;
}

export interface CourseInfoResponse {
  exists?: boolean;
  price?: number;
}

export interface GetCourseDetailsRequest {
  courseId?: string;
}

export interface CourseDetails {
  id?: string;
  title?: string;
  instructorId?: string;
  price?: number;
  description?: string;
  modules?: ModuleDetails[];
  coverImage?: string;
}

export interface ModuleDetails {
  id?: string;
  title?: string;
  lessons?: Lesson[];
  description?: string;
}

export interface AddResourceRequest {
  lessonId?: string;
  title?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface UpdateCourseRequest {
  courseId?: string;
  title?: string;
  description?: string;
  coverImage?: string;
}

export interface UpdateModuleRequest {
  moduleId?: string;
  title?: string;
  description?: string;
}

export interface UpdateLessonRequest {
  lessonId?: string;
  title?: string;
  description?: string;
}

export interface VerifyOwnershipRequest {
  userId?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

export interface VerifyOwnershipResponse {
  isOwner?: boolean;
}

export interface CatalogService {
  createCourse(request: CreateCourseRequest): Observable<Course> | Promise<Course> | Course;
  addModuleToCourse(request: AddModuleRequest): Observable<Module> | Promise<Module> | Module;
  addLessonToModule(request: AddLessonRequest): Observable<Lesson> | Promise<Lesson> | Lesson;
  updateLessonVideo(request: UpdateLessonVideoRequest): Observable<Lesson> | Promise<Lesson> | Lesson;
  getCoursesByIds(request: GetCoursesByIdsRequest): Observable<GetCoursesByIdsResponse> | Promise<GetCoursesByIdsResponse> | GetCoursesByIdsResponse;
  getCourseInfo(request: GetCourseInfoRequest): Observable<CourseInfoResponse> | Promise<CourseInfoResponse> | CourseInfoResponse;
  listCourses(request: ListCoursesRequest): Observable<ListCoursesResponse> | Promise<ListCoursesResponse> | ListCoursesResponse;
  getCourseDetails(request: GetCourseDetailsRequest): Observable<CourseDetails> | Promise<CourseDetails> | CourseDetails;
  updateCourse(request: UpdateCourseRequest): Observable<CourseDetails> | Promise<CourseDetails> | CourseDetails;
  addResourceToLesson(request: AddResourceRequest): Observable<Resource> | Promise<Resource> | Resource;
  updateModule(request: UpdateModuleRequest): Observable<Module> | Promise<Module> | Module;
  updateLesson(request: UpdateLessonRequest): Observable<Lesson> | Promise<Lesson> | Lesson;
  verifyOwnership(request: VerifyOwnershipRequest): Observable<VerifyOwnershipResponse> | Promise<VerifyOwnershipResponse> | VerifyOwnershipResponse;
}

// =========================================
// Namespace: Enrollment
// =========================================

export interface Enrollment {
  id?: string;
  courseId?: string;
  userId?: string;
  amountPaid?: number;
  progress?: number;
  completedLessons?: string[];
}

export interface EnrollStudentRequest {
  courseId?: string;
  userId?: string;
}

export interface UpdateProgressRequest {
  enrollmentId?: string;
  videoTimestamp?: number;
  totalDuration?: number;
}

export interface MarkLessonCompletedRequest {
  enrollmentId?: string;
  lessonId?: string;
}

export interface GetMyCoursesRequest {
  userId?: string;
}

export interface EnrolledCourse {
  enrollmentId?: string;
  progress?: number;
  courseId?: string;
  title?: string;
  instructorId?: string;
  completedLessons?: string[];
}

export interface GetMyCoursesResponse {
  enrollments?: EnrolledCourse[];
}

export interface EnrollmentService {
  enrollStudent(request: EnrollStudentRequest): Observable<Enrollment> | Promise<Enrollment> | Enrollment;
  updateProgress(request: UpdateProgressRequest): Observable<Enrollment> | Promise<Enrollment> | Enrollment;
  markLessonCompleted(request: MarkLessonCompletedRequest): Observable<Enrollment> | Promise<Enrollment> | Enrollment;
  getMyCourses(request: GetMyCoursesRequest): Observable<GetMyCoursesResponse> | Promise<GetMyCoursesResponse> | GetMyCoursesResponse;
}

// =========================================
// Namespace: Media
// =========================================

export interface GeneratePresignedUrlRequest {
  fileName?: string;
  lessonId?: string;
}

export interface GeneratePresignedUrlResponse {
  uploadUrl?: string;
  key?: string;
}

export interface ConfirmVideoUploadRequest {
  lessonId?: string;
  key?: string;
}

export interface ConfirmVideoUploadResponse {
  status?: string;
  hlsUrl?: string;
}

export interface MediaService {
  generatePresignedUrl(request: GeneratePresignedUrlRequest): Observable<GeneratePresignedUrlResponse> | Promise<GeneratePresignedUrlResponse> | GeneratePresignedUrlResponse;
  confirmVideoUpload(request: ConfirmVideoUploadRequest): Observable<ConfirmVideoUploadResponse> | Promise<ConfirmVideoUploadResponse> | ConfirmVideoUploadResponse;
}

// =========================================
// Namespace: Sales
// =========================================

export interface ProcessPaymentRequest {
  userId?: string;
  courseIds?: string[];
  amount?: number;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolder?: string;
}

export interface ProcessPaymentResponse {
  success?: boolean;
  transactionId?: string;
  message?: string;
}

export interface SalesService {
  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse> | Promise<ProcessPaymentResponse> | ProcessPaymentResponse;
}

// =========================================
// Namespace: User
// =========================================

export interface ValidateTokenRequest {
  token?: string;
}

export interface ValidateTokenResponse {
  isValid?: boolean;
  userId?: string;
  role?: string;
}

export interface BecomeInstructorRequest {
  token?: string;
}

export interface BecomeInstructorResponse {
  success?: boolean;
  role?: string;
}

export interface GetUsersByIdsRequest {
  userIds?: string[];
}

export interface GetUsersByIdsResponse {
  users?: UserSummary[];
}

export interface UserSummary {
  id?: string;
  name?: string;
  avatarUrl?: string;
}

export interface SyncProfileRequest {
  userId?: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
}

export interface SyncProfileResponse {
  success?: boolean;
  role?: string;
}

export interface UserService {
  validateToken(request: ValidateTokenRequest): Observable<ValidateTokenResponse> | Promise<ValidateTokenResponse> | ValidateTokenResponse;
  becomeInstructor(request: BecomeInstructorRequest): Observable<BecomeInstructorResponse> | Promise<BecomeInstructorResponse> | BecomeInstructorResponse;
  getUsersByIds(request: GetUsersByIdsRequest): Observable<GetUsersByIdsResponse> | Promise<GetUsersByIdsResponse> | GetUsersByIdsResponse;
  syncProfile(request: SyncProfileRequest): Observable<SyncProfileResponse> | Promise<SyncProfileResponse> | SyncProfileResponse;
}

