import { BaseEntity } from './base.entity';
import { Entity, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';

@Entity()
export class Classes extends BaseEntity {
  @ManyToOne(() => Teacher)
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.classes)
  @JoinTable()
  students: Student[];
}
