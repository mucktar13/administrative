import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { RegisterClassesReqDto } from './dto/register-classes.req.dto';
import { CommonStudentResDto } from './dto/common-student.res.dto';
import { SuspendStudentsReqDto } from './dto/suspend-student.req.dto';
import { ApiQuery } from '@nestjs/swagger';
import { CommonStudentReqDto } from './dto/common-student.req.dto';

@Controller('/')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('/register')
  @HttpCode(204)
  register(@Body() data: RegisterClassesReqDto) {
    return this.classesService.register(data);
  }

  @Get('/commonstudents')
  @ApiQuery({ name: 'teacher', type: [String], isArray: true, required: true })
  async commonstudents(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: CommonStudentReqDto,
  ): Promise<CommonStudentResDto> {
    const students = await this.classesService.common(query.teacher);

    return { students };
  }

  @Post('suspend')
  @HttpCode(204)
  suspend(@Body() data: SuspendStudentsReqDto) {
    return this.classesService.suspend(data);
  }
}
