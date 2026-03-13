import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RatingsService } from '../services/ratings.service';
import { UpsertRatingDto } from '../dto/upsert-rating.dto';

@Controller('sessions/:sessionId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  async upsertRating(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpsertRatingDto,
  ) {
    const rating = await this.ratingsService.upsertRating(sessionId, dto);
    return {
      id: rating.id,
      nameId: rating.nameId,
      participantId: rating.participantId,
      score: rating.score,
    };
  }

  @Get()
  async getRatings(@Param('sessionId') sessionId: string) {
    const rankings = await this.ratingsService.getTopRated(sessionId);
    return rankings;
  }

  @Get('participant')
  async getParticipantRatings(
    @Param('sessionId') sessionId: string,
    @Query('participantId') participantId: string,
  ) {
    const ratings = await this.ratingsService.getParticipantRatings(
      sessionId,
      participantId,
    );
    return ratings;
  }
}
