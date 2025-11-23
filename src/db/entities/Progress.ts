import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from './Profile';
import { Lesson } from './Lesson';

@Entity()
@Index('idx_progress_profile_lesson', ['profileId', 'lessonId'])
@Index('idx_progress_profile_completedAt', ['profileId', 'completedAt'])
export class Progress {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36 })
  profileId!: string;

  @Column('varchar', { length: 36 })
  lessonId!: string;

  @Column('datetime')
  completedAt!: Date;

  @Column('integer', { default: 1 })
  attempts!: number;

  @Column('integer')
  score!: number;

  @Column('integer')
  bestScore!: number;

  @Column('integer')
  stars!: number;

  @Column('integer')
  timeTakenSec!: number;

  @ManyToOne(() => Profile, profile => profile.progress)
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @ManyToOne(() => Lesson, lesson => lesson.progress)
  @JoinColumn({ name: 'lessonId' })
  lesson!: Lesson;
}
