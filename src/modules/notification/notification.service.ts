import { Inject, Injectable } from '@nestjs/common';
import { NotificationReqDto } from './dto/notification.req.dto';
import { NotificationResDto } from './dto/notification.res.dto';
import { extractEmailsFromMentions } from './helper/string';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(ClassesService)
    private classService: ClassesService,
  ) {}

  async notify(data: NotificationReqDto): Promise<NotificationResDto> {
    const mentioned = extractEmailsFromMentions(data.notification);
    const validStudent = await this.classService.filterExsistStudent(mentioned);
    const validMentionedStudent = validStudent.map((student) => student.email);

    const registeredStudent = await this.classService.getRegisteredStudent(
      data.teacher,
      validMentionedStudent,
    );

    return {
      recipients: [...validMentionedStudent, ...registeredStudent],
    };
  }
}
