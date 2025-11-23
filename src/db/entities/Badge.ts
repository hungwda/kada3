import { Entity, PrimaryColumn, Column, Index, OneToMany } from 'typeorm';
import { EarnedBadge } from './EarnedBadge';

@Entity()
@Index('uq_badge_code', ['code'], { unique: true })
export class Badge {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { unique: true })
  code!: string;

  @Column('varchar', { length: 48 })
  name!: string;

  @Column('varchar', { length: 160 })
  description!: string;

  @Column('text') // JSON stringified
  rule!: string;

  @Column('varchar', { nullable: true })
  icon?: string;

  @OneToMany(() => EarnedBadge, earnedBadge => earnedBadge.badge)
  earnedBadges!: EarnedBadge[];
}
