import type { ClientGrpc } from '@nestjs/microservices';

type ServiceMethods = Record<string, jest.Mock>;

export function mockGrpcClient(services: Record<string, ServiceMethods>): ClientGrpc {
  return {
    getService<T>(name: string): T {
      const service = services[name];
      if (!service) {
        return {} as T;
      }

      return service as T;
    },
  } as ClientGrpc;
}
