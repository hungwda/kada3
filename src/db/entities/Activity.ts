import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from './Lesson';

export enum ActivityType {
  TRACE = 'trace',
  MATCH_SOUND = 'match_sound',
  TAP_LETTER = 'tap_letter',
  QUIZ = 'quiz'
}

@Entity()
@Index('idx_activity_lesson_order', ['lessonId', 'order'])
export class Activity {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36 })
  lessonId!: string;

  @Column('varchar')
  type!: ActivityType;

  @Column('varchar', { nullable: true })
  promptRef?: string;

  @Column('text') // JSON stringified
  target!: string;

  @Column('integer', { default: 1 })
  difficulty!: number;

  @Column('integer', { default: 100 })
  maxScore!: number;

  @Column('integer')
  order!: number;

  @ManyToOne(() => Lesson, lesson => lesson.activities)
  @JoinColumn({ name: 'lessonId' })
  lesson!: Lesson;
}
