import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Progress } from './Progress';
import { Streak } from './Streak';
import { EarnedBadge } from './EarnedBadge';

@Entity()
export class Profile {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 24 })
  name!: string;

  @Column('varchar', { nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('datetime', { nullable: true })
  lastActiveAt?: Date;

  @OneToMany(() => Progress, progress => progress.profile)
  progress!: Progress[];

  @OneToOne(() => Streak, streak => streak.profile)
  streak?: Streak;

  @OneToMany(() => EarnedBadge, earnedBadge => earnedBadge.profile)
  earnedBadges!: EarnedBadge[];
}
