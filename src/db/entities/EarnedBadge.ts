import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from './Profile';
import { Badge } from './Badge';

@Entity()
@Index('uq_earnedBadge_profile_badge', ['profileId', 'badgeId'], { unique: true })
export class EarnedBadge {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36 })
  profileId!: string;

  @Column('varchar', { length: 36 })
  badgeId!: string;

  @Column('datetime')
  earnedAt!: Date;

  @ManyToOne(() => Profile, profile => profile.earnedBadges)
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @ManyToOne(() => Badge, badge => badge.earnedBadges)
  @JoinColumn({ name: 'badgeId' })
  badge!: Badge;
}
