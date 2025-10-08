import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { PreferenceValue } from '../../common/enums/preference-value.enum';
import { Participant } from '../../sessions/entities/participant.entity';
import { GivenName } from '../../names/entities/given-name.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity('preferences')
@Unique(['participantId', 'nameId'])
export class Preference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: PreferenceValue })
  value!: PreferenceValue;

  @Column({ type: 'uuid' })
  participantId!: string;

  @ManyToOne(() => Participant, (participant) => participant.preferences, {
    onDelete: 'CASCADE',
  })
  participant!: Participant;

  @Column({ type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => Session, (session) => session.preferences, {
    onDelete: 'CASCADE',
  })
  session!: Session;

  @Column({ type: 'uuid' })
  nameId!: string;

  @ManyToOne(() => GivenName, { eager: true, onDelete: 'CASCADE' })
  name!: GivenName;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
