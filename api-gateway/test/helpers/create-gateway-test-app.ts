import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { of } from 'rxjs';
import { join } from 'path';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '../../src/auth.guard';
import { JwtStrategy } from '../../src/jwt.strategy';
import { OwnershipGuard } from '../../src/ownership.guard';
import { ResolvedUserGuard } from '../../src/resolved-user.guard';
import {
  mockAuthGuard,
  mockOwnershipGuard,
  mockResolvedUserGuard,
  TEST_TOKENS,
} from '../mocks/guard-mocks';
import { mockGrpcClient } from '../mocks/grpc-client.mock';

interface CreateGatewayTestAppOptions {
  ownershipAllowed?: boolean;
}

interface TestAppBundle {
  app: INestApplication;
  close: () => Promise<void>;
  catalogMocks: {
    CreateCourse: jest.Mock;
    GetCoursesByIds: jest.Mock;
    UpdateCourse: jest.Mock;
  };
  salesMocks: {
    ProcessPayment: jest.Mock;
  };
  enrollmentMocks: {
    EnrollStudent: jest.Mock;
  };
}

export async function createGatewayTestApp(
  options: CreateGatewayTestAppOptions = {},
): Promise<TestAppBundle> {
  process.env.PROTO_PATH = join(process.cwd(), '..', 'grpc-contracts');

  const catalogMocks = {
    CreateCourse: jest.fn((payload: unknown) => of({ id: 'course-created-1', ...payload })),
    GetCoursesByIds: jest.fn((payload: { courseIds: string[] }) => {
      const courseCatalog: Record<string, { id: string; price: number }> = {
        'course-1': { id: 'course-1', price: 100 },
        'course-2': { id: 'course-2', price: 50 },
      };

      const courses = payload.courseIds
        .map((courseId) => courseCatalog[courseId])
        .filter((course): course is { id: string; price: number } => Boolean(course));

      return of({ courses });
    }),
    UpdateCourse: jest.fn((payload: unknown) => of({ success: true, ...payload })),
    VerifyOwnership: jest.fn(() => of({ isOwner: options.ownershipAllowed ?? true })),
  };

  const salesMocks = {
    ProcessPayment: jest.fn(() => of({ success: true })),
  };

  const enrollmentMocks = {
    EnrollStudent: jest.fn(() => of({ success: true })),
  };

  const userMocks = {
    ValidateToken: jest.fn(),
    BecomeInstructor: jest.fn(),
    SyncProfile: jest.fn(),
    GetUsersByIds: jest.fn(() => of({ users: [] })),
  };

  const mediaMocks = {
    GeneratePresignedUrl: jest.fn(() => of({})),
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(JwtStrategy)
    .useValue({ validate: jest.fn() })
    .overrideProvider('USER_SERVICE')
    .useValue(
      mockGrpcClient({
        UserService: userMocks,
      }),
    )
    .overrideProvider('CATALOG_SERVICE')
    .useValue(
      mockGrpcClient({
        CatalogService: catalogMocks,
      }),
    )
    .overrideProvider('MEDIA_SERVICE')
    .useValue(
      mockGrpcClient({
        MediaService: mediaMocks,
      }),
    )
    .overrideProvider('ENROLLMENT_SERVICE')
    .useValue(
      mockGrpcClient({
        EnrollmentService: enrollmentMocks,
      }),
    )
    .overrideProvider('SALES_SERVICE')
    .useValue(
      mockGrpcClient({
        SalesService: salesMocks,
      }),
    )
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard())
    .overrideGuard(ResolvedUserGuard)
    .useValue(mockResolvedUserGuard())
    .overrideGuard(OwnershipGuard)
    .useValue(mockOwnershipGuard(options.ownershipAllowed ?? true))
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return {
    app,
    close: async () => {
      await app.close();
    },
    catalogMocks,
    salesMocks,
    enrollmentMocks,
  };
}

export { TEST_TOKENS };
