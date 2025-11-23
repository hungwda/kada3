import { Entity, PrimaryColumn, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './Profile';

@Entity()
@Index('uq_streak_profile', ['profileId'], { unique: true })
export class Streak {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36, unique: true })
  profileId!: string;

  @Column('integer', { default: 0 })
  currentCount!: number;

  @Column('integer', { default: 0 })
  longestCount!: number;

  @Column('date', { nullable: true })
  lastActiveDate?: string;

  @OneToOne(() => Profile, profile => profile.streak)
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;
}
