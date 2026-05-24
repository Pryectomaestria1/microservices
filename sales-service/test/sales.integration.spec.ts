import { Test, TestingModule } from '@nestjs/testing';
import type { ClientProxy } from '@nestjs/microservices';
import { AppModule } from '../src/app.module';
import { SalesService } from '../src/sales.service';

type CheckoutPayload = {
  userId: string;
  courseIds: string[];
  amount: number;
  cardNumber: string;
  cardHolder?: string;
};

describe('SalesService Integration (mock-based)', () => {
  let moduleFixture: TestingModule;
  let salesService: SalesService;
  let rabbitClientEmitMock: jest.Mock;

  beforeEach(async () => {
    rabbitClientEmitMock = jest.fn();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('RABBITMQ_SERVICE')
      .useValue({
        emit: rabbitClientEmitMock,
      } satisfies Pick<ClientProxy, 'emit'>)
      .compile();

    salesService = moduleFixture.get<SalesService>(SalesService);
    jest.spyOn(salesService, '$connect').mockResolvedValue();
    await salesService.onModuleInit();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await moduleFixture.close();
  });

  it('creates transaction and emits one event per course when card is valid', async () => {
    const createdTransaction = { id: 'tx-123' };
    const transactionCreateSpy = jest
      .spyOn(salesService.transaction, 'create')
      .mockResolvedValue(createdTransaction as never);

    const payload: CheckoutPayload = {
      userId: 'user-1',
      courseIds: ['course-a', 'course-b'],
      amount: 120,
      cardNumber: '1234567890123456',
      cardHolder: 'John Doe',
    };

    const result = await salesService.simulateCheckout(payload);

    expect(transactionCreateSpy).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        courseIds: ['course-a', 'course-b'],
        amount: 120,
        cardEnding: '3456',
        cardHolder: 'John Doe',
      },
    });
    expect(rabbitClientEmitMock).toHaveBeenNthCalledWith(1, 'course.purchased', {
      userId: 'user-1',
      courseId: 'course-a',
      transactionId: 'tx-123',
    });
    expect(rabbitClientEmitMock).toHaveBeenNthCalledWith(2, 'course.purchased', {
      userId: 'user-1',
      courseId: 'course-b',
      transactionId: 'tx-123',
    });
    expect(result).toEqual({
      success: true,
      transactionId: 'tx-123',
      message: 'Pago procesado exitosamente y evento emitido.',
    });
  });

  it('returns failure and skips persistence/emits when card number is shorter than 15 chars', async () => {
    const transactionCreateSpy = jest.spyOn(salesService.transaction, 'create');

    const payload: CheckoutPayload = {
      userId: 'user-2',
      courseIds: ['course-c'],
      amount: 80,
      cardNumber: '12345678901234',
    };

    const result = await salesService.simulateCheckout(payload);

    expect(transactionCreateSpy).not.toHaveBeenCalled();
    expect(rabbitClientEmitMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      transactionId: '',
      message: 'Tarjeta inválida',
    });
  });

  it('accepts exactly 15 chars as valid card length boundary', async () => {
    const createdTransaction = { id: 'tx-999' };
    const transactionCreateSpy = jest
      .spyOn(salesService.transaction, 'create')
      .mockResolvedValue(createdTransaction as never);

    const payload: CheckoutPayload = {
      userId: 'user-3',
      courseIds: ['course-z'],
      amount: 49.9,
      cardNumber: '123456789012345',
    };

    const result = await salesService.simulateCheckout(payload);

    expect(transactionCreateSpy).toHaveBeenCalledTimes(1);
    expect(rabbitClientEmitMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('tx-999');
  });
});
