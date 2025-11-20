import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GivenName } from '../entities/given-name.entity';
import { Session } from '../../sessions/entities/session.entity';
import { Preference } from '../../preferences/entities/preference.entity';
import { scoreNameForLastName, normalizeHungarianText, estimateSyllableCount } from '../../common/utils/text';
import { Gender } from '../../common/enums/gender.enum';

interface NextNameResult {
  name: GivenName;
  computedScore: number;
  remaining: number;
  reviewed: number;
}

@Injectable()
export class NamesService {
  constructor(
    @InjectRepository(GivenName)
    private readonly namesRepository: Repository<GivenName>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(Preference)
    private readonly preferenceRepository: Repository<Preference>,
  ) { }

  async getNextName(sessionId: string, participantId: string, preferredGender?: Gender): Promise<NextNameResult> {
    const session = await this.sessionsRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const ratedIds = await this.preferenceRepository
      .createQueryBuilder('preference')
      .select('preference.nameId', 'nameId')
      .where('preference.participantId = :participantId', { participantId })
      .andWhere('preference.sessionId = :sessionId', { sessionId })
      .getRawMany();

    // Also exclude names that ANY participant has disliked
    const dislikedByAnyIds = await this.preferenceRepository
      .createQueryBuilder('preference')
      .select('preference.nameId', 'nameId')
      .where('preference.sessionId = :sessionId', { sessionId })
      .andWhere('preference.value = :value', { value: 'DISLIKE' })
      .getRawMany();

    const excludedIds = [...new Set([
      ...ratedIds.map((row) => row.nameId),
      ...dislikedByAnyIds.map((row) => row.nameId),
    ])];

    const qb = this.namesRepository.createQueryBuilder('name');
    if (excludedIds.length) {
      qb.where('name.id NOT IN (:...excludedIds)', { excludedIds });
    }
    if (preferredGender) {
      if (excludedIds.length) {
        qb.andWhere('name.gender = :gender', { gender: preferredGender });
      } else {
        qb.where('name.gender = :gender', { gender: preferredGender });
      }
    }

    const candidateNames = await qb.orderBy('name.baseScore', 'DESC').limit(50).getMany();

    const scoredCandidates = candidateNames
      .map((candidate) => ({
        candidate,
        score: scoreNameForLastName(candidate.value, session.lastName) + candidate.baseScore,
        tieBreaker: Math.random(),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.tieBreaker - b.tieBreaker;
      });

    const nextCandidate = scoredCandidates[0];

    if (!nextCandidate) {
      throw new NotFoundException('No more names to review');
    }

    const totalNames = await this.namesRepository.count({
      where: preferredGender ? { gender: preferredGender } : {},
    });
    const reviewed = excludedIds.length;

    return {
      name: nextCandidate.candidate,
      computedScore: Number(nextCandidate.score.toFixed(3)),
      remaining: Math.max(totalNames - reviewed, 0),
      reviewed,
    };
  }

  async getRecommendations(sessionId: string, limit = 10, gender?: Gender) {
    const session = await this.sessionsRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const qb = this.namesRepository.createQueryBuilder('name');
    if (gender) {
      qb.where('name.gender = :gender', { gender });
    }
    const candidates = await qb.orderBy('name.baseScore', 'DESC').limit(200).getMany();

    const ranked = candidates
      .map((candidate) => ({
        candidate,
        score: scoreNameForLastName(candidate.value, session.lastName) + candidate.baseScore,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        id: item.candidate.id,
        value: item.candidate.value,
        gender: item.candidate.gender,
        score: Number(item.score.toFixed(3)),
      }));

    return ranked;
  }

  async searchNames(query: string | undefined, gender?: Gender, limit = 20) {
    const qb = this.namesRepository.createQueryBuilder('name');
    if (query) {
      qb.where('name.normalizedValue ILIKE :query', { query: `%${normalizeHungarianText(query)}%` });
    }
    if (gender) {
      qb.andWhere('name.gender = :gender', { gender });
    }
    const results = await qb.orderBy('name.baseScore', 'DESC').limit(limit).getMany();
    return results;
  }

  async computeBaseScores(lastName = 'Kovács') {
    const names = await this.namesRepository.find();
    for (const name of names) {
      name.syllableCount = estimateSyllableCount(name.value);
      name.baseScore = scoreNameForLastName(name.value, lastName);
    }
    await this.namesRepository.save(names);
  }
}
