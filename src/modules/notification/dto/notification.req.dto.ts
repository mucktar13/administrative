import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class NotificationReqDto {
  @ApiProperty({
    type: String,
    description: 'Teacher email',
    example: 'teacher@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  teacher: string;

  @ApiProperty({
    type: String,
    description: 'Notification message',
    example: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
  })
  @IsNotEmpty()
  notification: string;
}
