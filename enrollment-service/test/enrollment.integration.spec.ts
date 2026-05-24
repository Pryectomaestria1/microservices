import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AppModule } from '../src/app.module';
import { EnrollmentService } from '../src/enrollment.service';
import { mockGrpcClient } from './helpers/mock-grpc-client';

type EnrollPayload = {
  courseId: string;
  userId: string;
};

type CatalogServiceContract = {
  GetCourseInfo: jest.Mock;
  GetCoursesByIds: jest.Mock;
  GetCourseDetails: jest.Mock;
};

describe('EnrollmentService Integration (mock-based)', () => {
  let moduleFixture: TestingModule;
  let enrollmentService: EnrollmentService;
  let catalogServiceMock: CatalogServiceContract;

  beforeEach(async () => {
    catalogServiceMock = {
      GetCourseInfo: jest.fn(),
      GetCoursesByIds: jest.fn(),
      GetCourseDetails: jest.fn(),
    };

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('CATALOG_SERVICE')
      .useValue(
        mockGrpcClient({
          CatalogService: catalogServiceMock,
        }),
      )
      .compile();

    enrollmentService = moduleFixture.get<EnrollmentService>(EnrollmentService);

    jest.spyOn(enrollmentService, '$connect').mockResolvedValue();
    await enrollmentService.onModuleInit();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await moduleFixture.close();
  });

  it('enrolls student when course exists', async () => {
    catalogServiceMock.GetCourseInfo.mockReturnValue(of({ exists: true, price: 150 }));

    const upsertSpy = jest.spyOn(enrollmentService.enrollment, 'upsert').mockResolvedValue({
      id: 'enroll-1',
      courseId: 'course-a',
      userId: 'user-a',
      amountPaid: 150,
      progress: 0,
      completedLessons: [],
      createdAt: new Date(),
    } as never);

    const payload: EnrollPayload = { courseId: 'course-a', userId: 'user-a' };
    const result = await enrollmentService.enrollStudent(payload);

    expect(catalogServiceMock.GetCourseInfo).toHaveBeenCalledWith({ courseId: 'course-a' });
    expect(upsertSpy).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'user-a', courseId: 'course-a' } },
      create: { courseId: 'course-a', userId: 'user-a', amountPaid: 150, progress: 0 },
      update: {},
    });
    expect(result.id).toBe('enroll-1');
  });

  it('throws when catalog reports course does not exist', async () => {
    catalogServiceMock.GetCourseInfo.mockReturnValue(of({ exists: false }));

    const upsertSpy = jest.spyOn(enrollmentService.enrollment, 'upsert');
    const payload: EnrollPayload = { courseId: 'course-missing', userId: 'user-b' };

    await expect(enrollmentService.enrollStudent(payload)).rejects.toThrow('Course not found');
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('keeps idempotent behavior via upsert for duplicate events', async () => {
    catalogServiceMock.GetCourseInfo.mockReturnValue(of({ exists: true, price: 200 }));

    const upsertSpy = jest.spyOn(enrollmentService.enrollment, 'upsert').mockResolvedValue({
      id: 'existing-enrollment',
      courseId: 'course-b',
      userId: 'user-c',
      amountPaid: 200,
      progress: 10,
      completedLessons: ['l1'],
      createdAt: new Date(),
    } as never);

    const payload: EnrollPayload = { courseId: 'course-b', userId: 'user-c' };
    const result = await enrollmentService.enrollStudent(payload);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('existing-enrollment');
  });

  it('recovers from Prisma P2002 by reading existing enrollment', async () => {
    catalogServiceMock.GetCourseInfo.mockReturnValue(of({ exists: true, price: 99 }));

    jest.spyOn(enrollmentService.enrollment, 'upsert').mockRejectedValue({ code: 'P2002' });
    const findUniqueSpy = jest.spyOn(enrollmentService.enrollment, 'findUnique').mockResolvedValue({
      id: 'fallback-enroll',
      courseId: 'course-race',
      userId: 'user-race',
      amountPaid: 99,
      progress: 0,
      completedLessons: [],
      createdAt: new Date(),
    } as never);

    const payload: EnrollPayload = { courseId: 'course-race', userId: 'user-race' };
    const result = await enrollmentService.enrollStudent(payload);

    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'user-race', courseId: 'course-race' } },
    });
    expect(result?.id).toBe('fallback-enroll');
  });
});
