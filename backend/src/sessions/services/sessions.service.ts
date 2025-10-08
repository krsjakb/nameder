import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Participant } from '../entities/participant.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { JoinSessionDto } from '../dto/join-session.dto';
import { randomUUID } from 'crypto';
import { SessionPhase } from '../../common/enums/session-phase.enum';
import { UpdateSessionPhaseDto } from '../dto/update-session-phase.dto';
import { Preference } from '../../preferences/entities/preference.entity';
import { PreferenceValue } from '../../common/enums/preference-value.enum';
import { Rating } from '../../ratings/entities/rating.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Preference)
    private readonly preferenceRepository: Repository<Preference>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async createSession(dto: CreateSessionDto) {
    const session = this.sessionRepository.create({
      code: this.generateSessionCode(),
      lastName: dto.lastName.trim(),
    });
    await this.sessionRepository.save(session);

    const participant = this.participantRepository.create({
      displayName: dto.displayName.trim(),
      email: dto.email?.toLowerCase() ?? null,
      inviteCode: this.generateInviteCode(),
      isCreator: true,
      sessionId: session.id,
    });
    await this.participantRepository.save(participant);

    return { session, participant };
  }

  async joinSession(code: string, dto: JoinSessionDto) {
    const session = await this.sessionRepository.findOne({
      where: { code },
      relations: ['participants'],
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const participant = this.participantRepository.create({
      displayName: dto.displayName.trim(),
      email: dto.email?.toLowerCase() ?? null,
      inviteCode: this.generateInviteCode(),
      isCreator: false,
      sessionId: session.id,
    });
    await this.participantRepository.save(participant);

    return { session, participant };
  }

  async getSessionDetails(sessionId: string, participantId?: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['participants'],
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const likesCount = await this.preferenceRepository.count({
      where: { sessionId, value: PreferenceValue.LIKE },
    });
    const dislikesCount = await this.preferenceRepository.count({
      where: { sessionId, value: PreferenceValue.DISLIKE },
    });

    const mutualNames = await this.preferenceRepository
      .createQueryBuilder('preference')
      .select('preference.nameId', 'nameId')
      .addSelect('COUNT(DISTINCT preference.participantId)', 'likers')
      .where('preference.sessionId = :sessionId', { sessionId })
      .andWhere('preference.value = :like', { like: PreferenceValue.LIKE })
      .groupBy('preference.nameId')
      .having('COUNT(DISTINCT preference.participantId) >= :min', {
        min: Math.max(2, session.participants.length),
      })
      .getRawMany();

    const participant = participantId
      ? await this.participantRepository.findOne({
          where: { id: participantId, sessionId },
        })
      : null;

    const participantPreferences = participantId
      ? await this.preferenceRepository.count({ where: { participantId, sessionId } })
      : 0;

    const ratedMutualCount = participantId
      ? await this.ratingRepository
          .createQueryBuilder('rating')
          .where('rating.sessionId = :sessionId', { sessionId })
          .andWhere('rating.participantId = :participantId', { participantId })
          .getCount()
      : 0;

    return {
      session,
      participant,
      stats: {
        totalParticipants: session.participants.length,
        totalLikes: likesCount,
        totalDislikes: dislikesCount,
        mutualCount: mutualNames.length,
        ratedMutualCount,
        participantRatings: participantPreferences,
      },
    };
  }

  async updatePhase(sessionId: string, dto: UpdateSessionPhaseDto) {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    session.phase = dto.phase;
    session.completedPrimary = dto.phase === SessionPhase.FINAL;
    await this.sessionRepository.save(session);
    return session;
  }

  async ensureParticipant(sessionId: string, participantId: string) {
    const participant = await this.participantRepository.findOne({ where: { id: participantId, sessionId } });
    if (!participant) {
      throw new NotFoundException('Participant not found for session');
    }
    return participant;
  }

  private generateSessionCode() {
    return randomUUID().replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();
  }

  private generateInviteCode() {
    return randomUUID().replace(/[^A-Z0-9]/gi, '').slice(0, 10).toUpperCase();
  }
}
