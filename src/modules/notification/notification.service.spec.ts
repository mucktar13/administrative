import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ClassesService } from '../classes/classes.service';
import { NotificationReqDto } from './dto/notification.req.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let classService: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ClassesService,
          useValue: {
            filterExsistStudent: jest.fn(),
            getRegisteredStudent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    classService = module.get<ClassesService>(ClassesService);
  });

  describe('notify', () => {
    it('should call classService methods and return the expected recipients', async () => {
      const notificationReqDto: NotificationReqDto = {
        teacher: 'teacher@example.com',
        notification:
          'Hello students! @student1@example.com @student2@example.com',
      };
      const mockValidStudents = [{ email: 'student1@example.com' }];
      const mockRegisteredStudents = ['student3@example.com'];

      (classService.filterExsistStudent as jest.Mock).mockResolvedValue(
        mockValidStudents,
      );
      (classService.getRegisteredStudent as jest.Mock).mockResolvedValue(
        mockRegisteredStudents,
      );

      const result = await service.notify(notificationReqDto);

      expect(classService.filterExsistStudent).toHaveBeenCalledWith([
        'student1@example.com',
        'student2@example.com',
      ]);
      expect(classService.getRegisteredStudent).toHaveBeenCalledWith(
        notificationReqDto.teacher,
        ['student1@example.com'],
      );
      expect(result.recipients).toEqual([
        'student1@example.com',
        'student3@example.com',
      ]);
    });
  });
});
