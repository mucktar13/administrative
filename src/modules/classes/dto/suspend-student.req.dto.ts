import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SuspendStudentsReqDto {
  @ApiProperty({
    type: String,
    description: 'Student email',
    example: 'student1@example.com',
  })
  @IsEmail()
  student: string;
}
