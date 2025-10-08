import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Session } from './session.entity';
import { Preference } from '../../preferences/entities/preference.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  displayName!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  email?: string | null;

  @Index({ unique: true })
  @Column({ length: 16 })
  inviteCode!: string;

  @Column({ default: false })
  isCreator!: boolean;

  @Column({ type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => Session, (session) => session.participants, { onDelete: 'CASCADE' })
  session!: Session;

  @OneToMany(() => Preference, (preference) => preference.participant)
  preferences!: Preference[];

  @OneToMany(() => Rating, (rating) => rating.participant)
  ratings!: Rating[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
