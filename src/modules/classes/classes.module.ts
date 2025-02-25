import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classes } from 'src/database/classes.entity';
import { Student } from 'src/database/student.entity';
import { Teacher } from 'src/database/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Classes, Student, Teacher])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassModule {}
