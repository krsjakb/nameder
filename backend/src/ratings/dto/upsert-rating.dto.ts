import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class UpsertRatingDto {
  @IsUUID()
  participantId!: string;

  @IsUUID()
  nameId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;
}
