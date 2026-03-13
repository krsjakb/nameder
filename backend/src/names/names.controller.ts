import { Controller, Get, Param, Query } from '@nestjs/common';
import { NamesService } from './services/names.service';
import { NextNameQueryDto } from './dto/next-name-query.dto';
import { SearchNamesQueryDto } from './dto/search-names-query.dto';
import { Gender } from '../common/enums/gender.enum';

@Controller()
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Get('sessions/:sessionId/names/next')
  async getNextName(
    @Param('sessionId') sessionId: string,
    @Query() query: NextNameQueryDto,
  ) {
    const result = await this.namesService.getNextName(
      sessionId,
      query.participantId,
      query.preferredGender,
    );
    return {
      name: {
        id: result.name.id,
        value: result.name.value,
        gender: result.name.gender,
        syllableCount: result.name.syllableCount,
      },
      score: result.computedScore,
      remaining: result.remaining,
      reviewed: result.reviewed,
    };
  }

  @Get('sessions/:sessionId/names/recommendations')
  async getRecommendations(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: string,
    @Query('gender') gender?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 10;
    const normalizedGender =
      gender && Object.values(Gender).includes(gender as Gender)
        ? (gender as Gender)
        : undefined;
    const recommendations = await this.namesService.getRecommendations(
      sessionId,
      Number.isNaN(parsedLimit) ? 10 : parsedLimit,
      normalizedGender,
    );
    return recommendations;
  }

  @Get('names/search')
  async searchNames(@Query() query: SearchNamesQueryDto) {
    const limit = query.limit ?? 20;
    const results = await this.namesService.searchNames(
      query.query,
      query.gender,
      limit,
    );
    return results.map((name) => ({
      id: name.id,
      value: name.value,
      gender: name.gender,
      score: name.baseScore,
    }));
  }
}
