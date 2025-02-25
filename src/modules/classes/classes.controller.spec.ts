import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { RegisterClassesReqDto } from './dto/register-classes.req.dto';
import { CommonStudentReqDto } from './dto/common-student.req.dto';
import { SuspendStudentsReqDto } from './dto/suspend-student.req.dto';

describe('ClassesController', () => {
  let classController: ClassesController;
  let classesService: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: {
            register: jest.fn(),
            common: jest.fn(),
            suspend: jest.fn(),
          },
        },
      ],
    }).compile();

    classController = module.get<ClassesController>(ClassesController);
    classesService = module.get<ClassesService>(ClassesService);
  });

  describe('register', () => {
    it('should call classesService.register with correct parameters', async () => {
      const registerDto: RegisterClassesReqDto = {
        teacher: 'test@example.com',
        students: ['student1@example.com', 'student2@example.com'],
      };

      await classController.register(registerDto);

      expect(classesService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('commonstudents', () => {
    it('should call classesService.common with correct parameters and return the expected response', async () => {
      const query: CommonStudentReqDto = {
        teacher: ['test1@example.com', 'test2@example.com'],
      };
      const expectedStudents = ['student3@example.com', 'student4@example.com'];
      (classesService.common as jest.Mock).mockResolvedValue(expectedStudents);

      const result = await classController.commonstudents(query);

      expect(classesService.common).toHaveBeenCalledWith(query.teacher);
      expect(result).toEqual({ students: expectedStudents });
    });
  });

  describe('suspend', () => {
    it('should call classesService.suspend with correct parameters', async () => {
      const suspendDto: SuspendStudentsReqDto = {
        student: 'suspended@example.com',
      };

      await classController.suspend(suspendDto);

      expect(classesService.suspend).toHaveBeenCalledWith(suspendDto);
    });
  });
});
