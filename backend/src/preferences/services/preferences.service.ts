import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from '../entities/preference.entity';
import { PreferenceValue } from '../../common/enums/preference-value.enum';
import { SetPreferenceDto } from '../dto/set-preference.dto';
import { SessionsService } from '../../sessions/services/sessions.service';
import { GivenName } from '../../names/entities/given-name.entity';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(Preference)
    private readonly preferenceRepository: Repository<Preference>,
    @InjectRepository(GivenName)
    private readonly givenNameRepository: Repository<GivenName>,
    private readonly sessionsService: SessionsService,
  ) {}

  async setPreference(sessionId: string, dto: SetPreferenceDto) {
    const participant = await this.sessionsService.ensureParticipant(sessionId, dto.participantId);

    const preference = await this.preferenceRepository.findOne({
      where: { sessionId, participantId: participant.id, nameId: dto.nameId },
    });

    if (preference) {
      preference.value = dto.value;
      return this.preferenceRepository.save(preference);
    }

    const newPreference = this.preferenceRepository.create({
      sessionId,
      participantId: participant.id,
      nameId: dto.nameId,
      value: dto.value,
    });
    return this.preferenceRepository.save(newPreference);
  }

  async removePreference(sessionId: string, participantId: string, nameId: string) {
    await this.sessionsService.ensureParticipant(sessionId, participantId);
    await this.preferenceRepository.delete({ sessionId, participantId, nameId });
  }

  async getMutualNames(sessionId: string) {
    const { session } = await this.sessionsService.getSessionDetails(sessionId);
    const participantCount = Math.max(2, session.participants.length);

    const mutualResults = await this.preferenceRepository
      .createQueryBuilder('preference')
      .select('preference.nameId', 'nameId')
      .where('preference.sessionId = :sessionId', { sessionId })
      .andWhere('preference.value = :like', { like: PreferenceValue.LIKE })
      .groupBy('preference.nameId')
      .having('COUNT(DISTINCT preference.participantId) >= :participantCount', { participantCount })
      .getRawMany();

    const nameIds = mutualResults.map((row: { nameId: string }) => row.nameId);
    if (nameIds.length === 0) {
      return [];
    }

    return this.givenNameRepository
      .createQueryBuilder('name')
      .where('name.id IN (:...nameIds)', { nameIds })
      .orderBy('name.baseScore', 'DESC')
      .getMany();
  }

  async getParticipantSummary(sessionId: string, participantId: string) {
    await this.sessionsService.ensureParticipant(sessionId, participantId);
    const likeCount = await this.preferenceRepository.count({
      where: { sessionId, participantId, value: PreferenceValue.LIKE },
    });
    const dislikeCount = await this.preferenceRepository.count({
      where: { sessionId, participantId, value: PreferenceValue.DISLIKE },
    });
    return { likes: likeCount, dislikes: dislikeCount };
  }
}
