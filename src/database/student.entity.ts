import { BaseEntity } from './base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { Classes } from './classes.entity';

@Entity()
export class Student extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  suspended: boolean;

  @Column({ type: 'timestamp', nullable: true })
  suspendedAt: Date | null;

  @ManyToMany(() => Classes, (classes) => classes.students)
  classes: Classes[];
}
