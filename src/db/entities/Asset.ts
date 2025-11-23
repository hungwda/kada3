import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

export enum AssetKind {
  AUDIO = 'audio',
  IMAGE = 'image',
  SPRITE = 'sprite',
  FONT = 'font',
  DATA = 'data'
}

@Entity()
@Index('idx_asset_path', ['path'])
export class Asset {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar')
  kind!: AssetKind;

  @Column('varchar')
  path!: string;

  @Column('varchar')
  checksum!: string;

  @Column('varchar')
  version!: string;
}
