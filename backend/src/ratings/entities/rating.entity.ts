import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Participant } from '../../sessions/entities/participant.entity';
import { GivenName } from '../../names/entities/given-name.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity('ratings')
@Unique(['participantId', 'nameId'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'uuid' })
  participantId!: string;

  @ManyToOne(() => Participant, (participant) => participant.ratings, { onDelete: 'CASCADE' })
  participant!: Participant;

  @Column({ type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => Session, (session) => session.ratings, { onDelete: 'CASCADE' })
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
