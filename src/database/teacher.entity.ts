import { BaseEntity } from './base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Classes } from './classes.entity';

@Entity()
export class Teacher extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @OneToMany(() => Classes, (classes) => classes.id)
  classes: Classes[];
}
