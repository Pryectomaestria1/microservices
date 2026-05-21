import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SalesService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async simulateCheckout(data: { userId: string; courseIds: string[]; amount: number; cardNumber: string; cardHolder?: string }) {
    if (!data.cardNumber || data.cardNumber.length < 15) {
      return { success: false, transactionId: '', message: 'Tarjeta inválida' };
    }

    const cardEnding = data.cardNumber.slice(-4);
    
    // Guardar transacción en la base de datos (estado 'COMPLETED' implicado por éxito de simulación)
    const transaction = await this.transaction.create({
      data: {
        userId: data.userId,
        courseIds: data.courseIds,
        amount: data.amount,
        cardEnding,
        cardHolder: data.cardHolder || 'Anonymous',
      },
    });

    // Emitir el evento de manera asíncrona a RabbitMQ
    data.courseIds.forEach(courseId => {
      this.rabbitClient.emit('course.purchased', {
        userId: data.userId,
        courseId,
        transactionId: transaction.id
      });
    });

    return { 
      success: true, 
      transactionId: transaction.id, 
      message: 'Pago procesado exitosamente y evento emitido.' 
    };
  }
}
