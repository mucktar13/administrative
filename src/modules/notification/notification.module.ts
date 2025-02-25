import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ClassModule } from '../classes/classes.module';

@Module({
  imports: [ClassModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
