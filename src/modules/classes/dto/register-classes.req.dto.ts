import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterClassesReqDto {
  @ApiProperty({
    type: String,
    description: 'Teacher email',
    example: 'teacher@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  teacher: string;

  @ApiProperty({
    type: [String],
    description: 'Array of students emails',
    example: ['student1@example.com', 'student2@example.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  students: Array<string>;
}
