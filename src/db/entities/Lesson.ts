import { Entity, PrimaryColumn, Column, Index, OneToMany } from 'typeorm';
import { Activity } from './Activity';
import { Progress } from './Progress';

export enum LessonType {
  LETTER = 'letter',
  INTRO = 'intro',
  PRONUNCIATION = 'pronunciation'
}

@Entity()
@Index('idx_lesson_order', ['order', 'type'])
export class Lesson {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { unique: true })
  code!: string;

  @Column('varchar', { length: 64 })
  title!: string;

  @Column('varchar')
  type!: LessonType;

  @Column('integer')
  order!: number;

  @Column('integer', { default: 2 })
  durationMin!: number;

  @Column('text', { nullable: true })
  assets?: string; // JSON stringified

  @Column('boolean', { default: true })
  enabled!: boolean;

  @OneToMany(() => Activity, activity => activity.lesson)
  activities!: Activity[];

  @OneToMany(() => Progress, progress => progress.lesson)
  progress!: Progress[];
}
