import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { RegisterClassesReqDto } from './dto/register-classes.req.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SuspendStudentsReqDto } from './dto/suspend-student.req.dto';
import { Classes } from '../../database/classes.entity';
import { Student } from '../../database/student.entity';
import { Teacher } from '../../database/teacher.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes)
    private classesRepository: Repository<Classes>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async common(teacher: string[]): Promise<string[]> {
    const queryBuilder = this.classesRepository
      .createQueryBuilder('classes')
      .leftJoin('classes.teacher', 'teacher')
      .leftJoin('classes.students', 'students')
      .select('students.email')
      .where('teacher.email IN (:...teacher)', { teacher })
      .andWhere('students.suspended = :suspended', { suspended: false })
      .groupBy('students.email')
      .having('COUNT(DISTINCT teacher.id) = :teacherCount', {
        teacherCount: teacher.length,
      });

    const result = await queryBuilder.getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.map((row) => row.students_email);
  }

  async register(attributes: RegisterClassesReqDto): Promise<void> {
    // Ensure teacher exists
    const teacher = await this.ensureTeacherExists(attributes.teacher);

    // Get valid (non-suspended) students
    const validStudents = await this.getValidStudents(attributes.students);

    // Update or create teacher's class
    await this.upsertClass(teacher, validStudents);
  }

  async suspend(attributes: SuspendStudentsReqDto): Promise<void> {
    const email = attributes.student;
    const student = await this.findAndValidateStudent(email);

    await Promise.all([
      this.markStudentsAsSuspended(student),
      this.removeStudentFromClasses(student),
    ]);
  }

  /**
   * Get registered student to a certain teacher, exclude specific student
   */
  async getRegisteredStudent(
    teacher: string,
    exclude: string[],
  ): Promise<string[]> {
    const queryBuilder = this.classesRepository
      .createQueryBuilder('classes')
      .leftJoin('classes.teacher', 'teacher')
      .leftJoin('classes.students', 'students')
      .select('students.email')
      .where('teacher.email = :teacher', { teacher })
      .andWhere('students.email NOT IN (:...exclude)', { exclude })
      .andWhere('students.suspended = :suspended', { suspended: false });

    const result = await queryBuilder.getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.map((row) => row.students_email);
  }

  async filterExsistStudent(emails: string[]): Promise<Student[]> {
    if (!emails.length) return [];

    // Find existing non-suspended students
    const students = await this.studentRepository.find({
      where: { email: In(emails), suspended: false },
    });

    return students;
  }

  /**
   * Ensures a teacher exists, creating if necessary
   */
  private async ensureTeacherExists(email: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { email },
    });

    if (teacher) return teacher;

    const newTeacher = this.teacherRepository.create({ email });

    return this.teacherRepository.save(newTeacher);
  }

  private async getValidStudents(emails: string[]): Promise<Student[]> {
    if (!emails.length) return [];

    // Get registered students
    const registeredStudents = await this.studentRepository.find({
      where: {
        email: In(emails),
      },
    });

    // Get suspended students
    const suspendedEmailSet = new Set(
      registeredStudents
        .filter((student) => student.suspended)
        .map((s) => s.email),
    );

    // Find existing non-suspended students
    const existingStudents = registeredStudents.filter(
      (student) => !student.suspended,
    );
    const existingEmailSet = new Set(existingStudents.map((s) => s.email));

    // remove suspended student for a valid registration email and exlude existing student
    const validEmails = emails
      .filter((email) => !suspendedEmailSet.has(email))
      .filter((email) => !existingEmailSet.has(email));

    // Create missing students
    const newStudents = validEmails.map((email) =>
      this.studentRepository.create({ email, suspended: false }),
    );

    if (newStudents.length) {
      await this.studentRepository.save(newStudents);
    }

    // Return all valid students (existing + newly created)
    return [...existingStudents, ...newStudents];
  }

  /**
   * Assigns students and teacher to a class, creating or updating as needed
   */
  private async upsertClass(
    teacher: Teacher,
    students: Student[],
  ): Promise<void> {
    // Find existing class for this teacher
    const existingClass = await this.classesRepository.findOne({
      where: { teacher: { id: teacher.id } },
      relations: ['students'],
    });

    if (!existingClass) {
      // Create new class
      const newClass = this.classesRepository.create({
        teacher,
        students,
      });

      await this.classesRepository.save(newClass);
      return;
    }

    // Update existing class - add only students that aren't already in the class
    const currentStudentIds = new Set(
      existingClass.students?.map((student) => student.id) || [],
    );

    const studentsToAdd = students.filter(
      (student) => !currentStudentIds.has(student.id),
    );
    if (studentsToAdd.length) {
      existingClass.students = [
        ...(existingClass.students || []),
        ...studentsToAdd,
      ];

      await this.classesRepository.save(existingClass);
    }
  }

  /**
   * Find student by email and validates exist
   */
  private async findAndValidateStudent(email: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { email: email },
    });

    if (!student) {
      throw new NotFoundException('Student emails not found');
    }

    return student;
  }

  /**
   * Marks student as suspended
   */
  private async markStudentsAsSuspended(student: Student): Promise<void> {
    student.suspended = true;
    student.suspendedAt = new Date();

    await this.studentRepository.save(student);
  }

  /**
   * Removes student from all classes they're enrolled in
   */
  private async removeStudentFromClasses(student: Student): Promise<void> {
    // Remove student from all classes
    student.classes = [];

    // Save the updated student entity
    await this.studentRepository.save(student);
  }
}
