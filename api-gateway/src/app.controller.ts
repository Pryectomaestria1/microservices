import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('v1')
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('COURSE_SERVICE') private readonly courseClient: ClientProxy,
  ) {}

  @Post('auth/register')
  register(@Body() data: any) {
    return this.authClient.send({ cmd: 'register' }, data);
  }

  @Post('auth/login')
  login(@Body() data: any) {
    return this.authClient.send({ cmd: 'login' }, data);
  }

  @Get('courses')
  getCourses() {
    return this.courseClient.send({ cmd: 'get_courses' }, {});
  }

  @Post('courses')
  createCourse(@Body() data: any) {
    return this.courseClient.send({ cmd: 'create_course' }, data);
  }
}
