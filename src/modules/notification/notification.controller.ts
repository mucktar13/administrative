import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationReqDto } from './dto/notification.req.dto';
import { NotificationResDto } from './dto/notification.res.dto';

@Controller('/')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/retrievefornotifications')
  @HttpCode(200)
  create(@Body() data: NotificationReqDto): Promise<NotificationResDto> {
    return this.notificationService.notify(data);
  }
}
