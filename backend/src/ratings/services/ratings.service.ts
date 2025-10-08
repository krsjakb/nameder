import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { UpsertRatingDto } from '../dto/upsert-rating.dto';
import { SessionsService } from '../../sessions/services/sessions.service';
import { Preference } from '../../preferences/entities/preference.entity';
import { PreferenceValue } from '../../common/enums/preference-value.enum';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Preference)
    private readonly preferenceRepository: Repository<Preference>,
    private readonly sessionsService: SessionsService,
  ) {}

  async upsertRating(sessionId: string, dto: UpsertRatingDto) {
    await this.sessionsService.ensureParticipant(sessionId, dto.participantId);
    const mutual = await this.preferenceRepository
      .createQueryBuilder('preference')
      .select('preference.nameId', 'nameId')
      .addSelect('COUNT(DISTINCT preference.participantId)', 'likers')
      .where('preference.sessionId = :sessionId', { sessionId })
      .andWhere('preference.nameId = :nameId', { nameId: dto.nameId })
      .andWhere('preference.value = :value', { value: PreferenceValue.LIKE })
      .groupBy('preference.nameId')
      .having('COUNT(DISTINCT preference.participantId) >= :min', { min: 2 })
      .getRawOne();

    if (!mutual) {
      throw new BadRequestException('Name must be mutually liked before rating');
    }

    const existing = await this.ratingRepository.findOne({
      where: { sessionId, participantId: dto.participantId, nameId: dto.nameId },
    });
    if (existing) {
      existing.score = dto.score;
      return this.ratingRepository.save(existing);
    }
    const rating = this.ratingRepository.create({
      sessionId,
      participantId: dto.participantId,
      nameId: dto.nameId,
      score: dto.score,
    });
    return this.ratingRepository.save(rating);
  }

  async getTopRated(sessionId: string) {
    const rows = await this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoin('rating.name', 'name')
      .select('rating.nameId', 'nameId')
      .addSelect('name.value', 'nameValue')
      .addSelect('name.gender', 'nameGender')
      .addSelect('AVG(rating.score)', 'average')
      .addSelect('COUNT(rating.id)', 'votes')
      .where('rating.sessionId = :sessionId', { sessionId })
      .groupBy('rating.nameId')
      .addGroupBy('name.id')
      .orderBy('average', 'DESC')
      .addOrderBy('votes', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      nameId: row.nameId,
      name: {
        id: row.nameId,
        value: row.nameValue,
        gender: row.nameGender,
      },
      average: Number(row.average),
      votes: Number(row.votes),
    }));
  }

  async getParticipantRatings(sessionId: string, participantId: string) {
    await this.sessionsService.ensureParticipant(sessionId, participantId);
    const ratings = await this.ratingRepository.find({
      where: { sessionId, participantId },
    });
    return ratings.map((rating) => ({
      nameId: rating.nameId,
      score: rating.score,
    }));
  }
}
