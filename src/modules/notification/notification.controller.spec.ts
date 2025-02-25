import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationReqDto } from './dto/notification.req.dto';
import { NotificationResDto } from './dto/notification.res.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            notify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  describe('create', () => {
    it('should call notificationService.notify with correct parameters and return the expected response', async () => {
      const notificationReqDto: NotificationReqDto = {
        teacher: 'teacher@example.com',
        notification: 'Hello students!',
      };
      const expectedResult: NotificationResDto = {
        recipients: ['teacher@example.com'], // Assuming the service returns the teacher as recipient
      };
      (service.notify as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(notificationReqDto);

      expect(service.notify).toHaveBeenCalledWith(notificationReqDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
