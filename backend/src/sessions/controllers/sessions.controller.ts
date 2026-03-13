import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SessionsService } from '../services/sessions.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { JoinSessionDto } from '../dto/join-session.dto';
import { UpdateSessionPhaseDto } from '../dto/update-session-phase.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async createSession(@Body() dto: CreateSessionDto) {
    const { session, participant } =
      await this.sessionsService.createSession(dto);
    return {
      session: {
        id: session.id,
        code: session.code,
        lastName: session.lastName,
        phase: session.phase,
      },
      participant: {
        id: participant.id,
        displayName: participant.displayName,
        inviteCode: participant.inviteCode,
        isCreator: participant.isCreator,
      },
    };
  }

  @Post(':code/join')
  async joinSession(@Param('code') code: string, @Body() dto: JoinSessionDto) {
    const { session, participant } = await this.sessionsService.joinSession(
      code,
      dto,
    );
    return {
      session: {
        id: session.id,
        code: session.code,
        lastName: session.lastName,
        phase: session.phase,
      },
      participant: {
        id: participant.id,
        displayName: participant.displayName,
        inviteCode: participant.inviteCode,
        isCreator: participant.isCreator,
      },
    };
  }

  @Get('code/:code')
  async getSessionByCode(@Param('code') code: string) {
    const session = await this.sessionsService.getSessionByCode(code);
    return {
      session: {
        id: session.id,
        code: session.code,
        lastName: session.lastName,
        phase: session.phase,
      },
      participants: session.participants.map((participant) => ({
        id: participant.id,
        displayName: participant.displayName,
        inviteCode: participant.inviteCode,
        isCreator: participant.isCreator,
      })),
    };
  }

  @Get(':sessionId')
  async getSession(
    @Param('sessionId') sessionId: string,
    @Query('participantId') participantId?: string,
  ) {
    const result = await this.sessionsService.getSessionDetails(
      sessionId,
      participantId,
    );
    return {
      session: {
        id: result.session.id,
        code: result.session.code,
        lastName: result.session.lastName,
        phase: result.session.phase,
        createdAt: result.session.createdAt,
      },
      participants: result.session.participants.map((participant) => ({
        id: participant.id,
        displayName: participant.displayName,
        inviteCode: participant.inviteCode,
        isCreator: participant.isCreator,
      })),
      stats: result.stats,
      participant: result.participant
        ? {
            id: result.participant.id,
            displayName: result.participant.displayName,
            inviteCode: result.participant.inviteCode,
            isCreator: result.participant.isCreator,
          }
        : null,
    };
  }

  @Patch(':sessionId/phase')
  async updatePhase(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionPhaseDto,
  ) {
    const session = await this.sessionsService.updatePhase(sessionId, dto);
    return {
      id: session.id,
      phase: session.phase,
      completedPrimary: session.completedPrimary,
    };
  }
}
