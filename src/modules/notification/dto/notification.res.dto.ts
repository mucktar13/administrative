import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class NotificationResDto {
  @ApiProperty({
    type: [String],
    description: 'Notification message recipients',
    example: ['studentagnes@gmail.com', 'studentmiche@gmail.com'],
  })
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  recipients: string[];
}
