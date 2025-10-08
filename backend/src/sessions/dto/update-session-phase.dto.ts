import { IsEnum } from 'class-validator';
import { SessionPhase } from '../../common/enums/session-phase.enum';

export class UpdateSessionPhaseDto {
  @IsEnum(SessionPhase)
  phase!: SessionPhase;
}
