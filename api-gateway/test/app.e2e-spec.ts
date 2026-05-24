import request from 'supertest';
import { createGatewayTestApp, TEST_TOKENS } from './helpers/create-gateway-test-app';

jest.mock('../src/jwt.strategy', () => ({
  JwtStrategy: class JwtStrategyMock {
    validate() {
      return { userId: 'mock-user', role: 'student' };
    }
  },
}));

describe('API Gateway integration (mocked dependencies)', () => {
  it('keeps health endpoint public', async () => {
    const testApp = await createGatewayTestApp();

    await request(testApp.app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });

    await testApp.close();
  });

  it('rejects checkout when unauthenticated', async () => {
    const testApp = await createGatewayTestApp();

    await request(testApp.app.getHttpServer())
      .post('/sales/checkout')
      .send({
        courseIds: ['course-1'],
        cardNumber: '4242424242424242',
        expiryDate: '12/30',
        cvv: '123',
        cardHolder: 'Test User',
      })
      .expect(401);

    await testApp.close();
  });

  it('forbids student on instructor-only route', async () => {
    const testApp = await createGatewayTestApp();

    await request(testApp.app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${TEST_TOKENS.STUDENT}`)
      .send({ title: 'New Course', description: 'Course description', price: 50 })
      .expect(403);

    await testApp.close();
  });

  it('allows instructor on instructor-only route', async () => {
    const testApp = await createGatewayTestApp();

    const response = await request(testApp.app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${TEST_TOKENS.INSTRUCTOR}`)
      .send({ title: 'New Course', description: 'Course description', price: 50 })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({ title: 'New Course', instructorId: 'instructor-1' }),
    );
    expect(testApp.catalogMocks.CreateCourse).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Course',
        instructorId: 'instructor-1',
      }),
    );

    await testApp.close();
  });

  it('rejects checkout with invalid courseIds', async () => {
    const testApp = await createGatewayTestApp();

    await request(testApp.app.getHttpServer())
      .post('/sales/checkout')
      .set('Authorization', `Bearer ${TEST_TOKENS.STUDENT}`)
      .send({
        courseIds: [' ', ''],
        cardNumber: '4242424242424242',
        expiryDate: '12/30',
        cvv: '123',
        cardHolder: 'Student User',
      })
      .expect(400);

    expect(testApp.catalogMocks.GetCoursesByIds).not.toHaveBeenCalled();
    await testApp.close();
  });

  it('processes checkout using server-side derived user and amount', async () => {
    const testApp = await createGatewayTestApp();

    await request(testApp.app.getHttpServer())
      .post('/sales/checkout')
      .set('Authorization', `Bearer ${TEST_TOKENS.STUDENT}`)
      .send({
        courseIds: ['course-1', 'course-2', 'course-1'],
        userId: 'tampered-user',
        amount: 1,
        cardNumber: '4242424242424242',
        expiryDate: '12/30',
        cvv: '123',
        cardHolder: 'Student User',
      })
      .expect(201);

    expect(testApp.catalogMocks.GetCoursesByIds).toHaveBeenCalledWith({
      courseIds: ['course-1', 'course-2'],
    });
    expect(testApp.salesMocks.ProcessPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'student-1',
        amount: 150,
        courseIds: ['course-1', 'course-2'],
      }),
    );
    expect(testApp.enrollmentMocks.EnrollStudent).toHaveBeenCalledTimes(2);

    await testApp.close();
  });

  it('rejects ownership-protected route when instructor is not owner', async () => {
    const testApp = await createGatewayTestApp({ ownershipAllowed: false });

    await request(testApp.app.getHttpServer())
      .put('/courses/course-1')
      .set('Authorization', `Bearer ${TEST_TOKENS.INSTRUCTOR}`)
      .send({ title: 'Updated title', description: 'Updated description' })
      .expect(403);

    expect(testApp.catalogMocks.UpdateCourse).not.toHaveBeenCalled();
    await testApp.close();
  });
});
