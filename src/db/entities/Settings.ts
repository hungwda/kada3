import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum LanguagePref {
  KN = 'kn',
  KN_EN_HELPERS = 'kn_en_helpers'
}

@Entity()
export class Settings {
  @PrimaryColumn('integer')
  id!: number; // Singleton: always 1

  @Column('varchar', { default: LanguagePref.KN_EN_HELPERS })
  languagePref!: LanguagePref;

  @Column('boolean', { default: true })
  audioOn!: boolean;

  @Column('boolean', { default: true })
  hapticsOn!: boolean;
}
