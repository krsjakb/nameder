import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Participant } from './participant.entity';
import { SessionPhase } from '../../common/enums/session-phase.enum';
import { Preference } from '../../preferences/entities/preference.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 12 })
  code!: string;

  @Column({ length: 120 })
  lastName!: string;

  @Column({ type: 'enum', enum: SessionPhase, default: SessionPhase.PRIMARY })
  phase!: SessionPhase;

  @Column({ default: false })
  completedPrimary!: boolean;

  @OneToMany(() => Participant, (participant) => participant.session)
  participants!: Participant[];

  @OneToMany(() => Preference, (preference) => preference.session)
  preferences!: Preference[];

  @OneToMany(() => Rating, (rating) => rating.session)
  ratings!: Rating[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
