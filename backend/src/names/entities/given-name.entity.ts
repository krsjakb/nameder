import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Gender } from '../../common/enums/gender.enum';

@Entity('given_names')
@Unique(['value'])
export class GivenName {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  value!: string;

  @Index()
  @Column({ length: 120 })
  normalizedValue!: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.UNISEX })
  gender!: Gender;

  @Column({ type: 'float', default: 0 })
  baseScore!: number;

  @Column({ type: 'int', default: 0 })
  syllableCount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
