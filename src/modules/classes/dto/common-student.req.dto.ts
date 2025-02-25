import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsEmail, IsNotEmpty } from 'class-validator';

export class CommonStudentReqDto {
  @ApiProperty({
    type: [String],
    description: 'Array of teacher emails',
    example: ['teacher1@example.com', 'teacher2@example.com'],
  })
  @IsNotEmpty({ message: 'Teacher email parameter is required' })
  @ArrayMinSize(1, { message: 'At least one teacher email must be provided' })
  @IsEmail(
    {},
    { each: true, message: 'Each email must be a valid email address' },
  )
  @Transform(({ value }): string[] => {
    // Handle both single string and array of strings
    return Array.isArray(value) ? value : value ? [value] : [];
  })
  teacher: string[];
}
