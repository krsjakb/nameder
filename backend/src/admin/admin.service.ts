import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../sessions/entities/session.entity';
import { Participant } from '../sessions/entities/participant.entity';
import { Preference } from '../preferences/entities/preference.entity';
import { GivenName } from '../names/entities/given-name.entity';
import { PreferenceValue } from '../common/enums/preference-value.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
    @InjectRepository(GivenName)
    private nameRepository: Repository<GivenName>,
  ) {}

  async getStats() {
    const totalSessions = await this.sessionRepository.count();
    const totalParticipants = await this.participantRepository.count();
    const totalSwipes = await this.preferenceRepository.count();
    const totalLikes = await this.preferenceRepository.count({
      where: { value: PreferenceValue.LIKE },
    });

    // Calculate matches (naive approach: names liked by >1 person in same session)
    // For a proper match count we'd need a more complex query, but this is a good approximation for stats

    const matchesQuery: Array<{ count: string }> = await this
      .preferenceRepository.query(`
      SELECT count(*) as count FROM (
        SELECT "sessionId", "nameId"
        FROM preferences
        WHERE value = 'LIKE'
        GROUP BY "sessionId", "nameId"
        HAVING count(*) > 1
      ) as matches
    `);
    const totalMatches = parseInt(matchesQuery[0].count || '0', 10);

    return {
      totalSessions,
      totalParticipants,
      totalSwipes,
      totalLikes,
      totalMatches,
    };
  }

  async getSessions(limit = 20, offset = 0) {
    const [items, total] = await this.sessionRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['participants'],
    });

    return {
      items,
      total,
    };
  }

  async getTopNames(limit = 20) {
    // Get top liked names
    const topNames = await this.preferenceRepository
      .createQueryBuilder('pref')
      .select('pref.nameId', 'nameId')
      .addSelect('COUNT(pref.id)', 'likeCount')
      .where("pref.value = 'LIKE'")
      .groupBy('pref.nameId')
      .orderBy('"likeCount"', 'DESC')
      .limit(limit)
      .getRawMany<{ nameId: string; likeCount: string }>();

    // Fetch name details
    const results: Array<GivenName & { likeCount: number }> = [];
    for (const item of topNames) {
      const name = await this.nameRepository.findOne({
        where: { id: item.nameId },
      });
      if (name) {
        results.push({
          ...name,
          likeCount: parseInt(item.likeCount, 10),
        });
      }
    }

    return results;
  }
}
