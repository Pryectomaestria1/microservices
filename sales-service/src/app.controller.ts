import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SalesService } from './sales.service';

@Controller()
export class AppController {
  constructor(private readonly salesService: SalesService) {}

  @GrpcMethod('SalesService', 'ProcessPayment')
  async processPayment(data: { userId: string; courseIds: string[]; amount: number; cardNumber: string; cardHolder?: string }) {
    return await this.salesService.simulateCheckout(data);
  }
}
