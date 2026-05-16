import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'get_courses' })
  getCourses() {
    console.log('Course-Service: Obteniendo catálogo');
    return [
      { id: '1', title: 'Curso de NestJS Microservicios', price: 99.99, instructor: { name: 'Micro Gabo' } },
      { id: '2', title: 'Arquitectura Escalable', price: 149.99, instructor: { name: 'Ingeniero Jefe' } }
    ];
  }

  @MessagePattern({ cmd: 'create_course' })
  createCourse(data: any) {
    console.log('Course-Service: Creando nuevo curso', data.title);
    return { status: 'success', courseId: 'new-course-123' };
  }
}
