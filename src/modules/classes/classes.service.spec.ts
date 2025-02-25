import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Classes } from '../../database/classes.entity';
import { Student } from '../../database/student.entity';
import { Teacher } from '../../database/teacher.entity';
import { RegisterClassesReqDto } from './dto/register-classes.req.dto';
import { SuspendStudentsReqDto } from './dto/suspend-student.req.dto';
import { NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';

describe('ClassesService', () => {
  let service: ClassesService;
  let classesRepository;
  let studentRepository;
  let teacherRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(Classes),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              having: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            }),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classesRepository = module.get(getRepositoryToken(Classes));
    studentRepository = module.get(getRepositoryToken(Student));
    teacherRepository = module.get(getRepositoryToken(Teacher));
  });

  describe('common', () => {
    it('should return an array of student emails', async () => {
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      const mockResult = [
        { students_email: 'student1@example.com' },
        { students_email: 'student2@example.com' },
      ];
      (
        classesRepository.createQueryBuilder().getRawMany as jest.Mock
      ).mockResolvedValue(mockResult);

      const result = await service.common(teacherEmails);

      expect(
        classesRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalled();
      expect(result).toEqual(['student1@example.com', 'student2@example.com']);
    });

    it('should return an empty array if no students are found', async () => {
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      (
        classesRepository.createQueryBuilder().getRawMany as jest.Mock
      ).mockResolvedValue([]);

      const result = await service.common(teacherEmails);

      expect(
        classesRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('register', () => {
    it('should register a class successfully', async () => {
      const registerDto: RegisterClassesReqDto = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com'],
      };
      const mockTeacher = { id: 1, email: 'teacher@example.com' };
      const mockStudents = [
        { id: 1, email: 'student1@example.com', suspended: false },
        { id: 2, email: 'student2@example.com', suspended: false },
      ];

      (teacherRepository.findOne as jest.Mock).mockResolvedValue(mockTeacher);
      (studentRepository.find as jest.Mock).mockResolvedValue(mockStudents);
      (classesRepository.findOne as jest.Mock).mockResolvedValue(null); // Simulate no existing class
      (classesRepository.save as jest.Mock).mockResolvedValue({});

      await service.register(registerDto);

      expect(teacherRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.teacher },
      });
      expect(studentRepository.find).toHaveBeenCalledWith({
        where: { email: In(registerDto.students) },
      });
      expect(classesRepository.save).toHaveBeenCalled();
    });

    it('should create new teacher and students if they do not exist', async () => {
      const registerDto: RegisterClassesReqDto = {
        teacher: 'newteacher@example.com',
        students: ['newstudent1@example.com', 'newstudent2@example.com'],
      };

      (teacherRepository.findOne as jest.Mock).mockResolvedValue(null); // Teacher not found
      (teacherRepository.create as jest.Mock).mockReturnValue({
        email: registerDto.teacher,
      });
      (teacherRepository.save as jest.Mock).mockReturnValue({
        id: '1',
        email: registerDto.teacher,
      });
      (studentRepository.find as jest.Mock).mockResolvedValue([]); // Students not found
      (studentRepository.create as jest.Mock)
        .mockReturnValueOnce({
          email: registerDto.students[0],
          suspended: false,
        })
        .mockReturnValueOnce({
          email: registerDto.students[1],
          suspended: false,
        });
      (classesRepository.findOne as jest.Mock).mockResolvedValue(null); // Simulate no existing class
      (classesRepository.save as jest.Mock).mockResolvedValue({});

      await service.register(registerDto);

      expect(teacherRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.teacher },
      });
      expect(teacherRepository.create).toHaveBeenCalledWith({
        email: registerDto.teacher,
      });
      expect(studentRepository.find).toHaveBeenCalledWith({
        where: { email: In(registerDto.students) },
      });
      expect(studentRepository.create).toHaveBeenCalledWith({
        email: registerDto.students[0],
        suspended: false,
      });
      expect(studentRepository.create).toHaveBeenCalledWith({
        email: registerDto.students[1],
        suspended: false,
      });
      expect(teacherRepository.save).toHaveBeenCalled();
      expect(studentRepository.save).toHaveBeenCalled();
      expect(classesRepository.save).toHaveBeenCalled();
    });
  });

  describe('suspend', () => {
    it('should suspend a student successfully (positive case)', async () => {
      const suspendDto: SuspendStudentsReqDto = {
        student: 'student@example.com',
      };
      const mockStudent = {
        id: 1,
        email: 'student@example.com',
        suspended: false,
        suspendedAt: null,
      };

      (studentRepository.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (studentRepository.save as jest.Mock).mockResolvedValue({
        ...mockStudent,
        suspended: true,
        suspendedAt: expect.any(Date),
      });
      (classesRepository.find as jest.Mock).mockResolvedValue([]); // Simulate no classes
      (studentRepository.save as jest.Mock).mockResolvedValue(mockStudent);

      await service.suspend(suspendDto);

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { email: suspendDto.student },
      });
      expect(studentRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if student is not found', async () => {
      const suspendDto: SuspendStudentsReqDto = {
        student: 'nonexistent@example.com',
      };

      (studentRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.suspend(suspendDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not throw an error if the student is already suspended', async () => {
      const suspendDto: SuspendStudentsReqDto = {
        student: 'student@example.com',
      };
      const mockStudent = {
        id: 1,
        email: 'student@example.com',
        suspended: true,
        suspendedAt: new Date(),
      };

      (studentRepository.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (studentRepository.save as jest.Mock).mockResolvedValue(mockStudent);
      (classesRepository.find as jest.Mock).mockResolvedValue([]); // Simulate no classes

      await expect(service.suspend(suspendDto)).resolves.not.toThrow();
      expect(studentRepository.save).toHaveBeenCalled();
    });
  });
});
