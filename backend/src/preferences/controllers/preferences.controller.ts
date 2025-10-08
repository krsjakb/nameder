import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PreferencesService } from '../services/preferences.service';
import { SetPreferenceDto } from '../dto/set-preference.dto';

@Controller('sessions/:sessionId/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Post()
  async setPreference(@Param('sessionId') sessionId: string, @Body() dto: SetPreferenceDto) {
    const preference = await this.preferencesService.setPreference(sessionId, dto);
    return {
      id: preference.id,
      value: preference.value,
      nameId: preference.nameId,
      participantId: preference.participantId,
    };
  }

  @Get('mutual')
  async getMutual(@Param('sessionId') sessionId: string) {
    const mutual = await this.preferencesService.getMutualNames(sessionId);
    return mutual.map((name) => ({
      id: name.id,
      value: name.value,
      gender: name.gender,
    }));
  }

  @Get('summary')
  async getSummary(@Param('sessionId') sessionId: string, @Query('participantId') participantId: string) {
    const summary = await this.preferencesService.getParticipantSummary(sessionId, participantId);
    return summary;
  }
}
