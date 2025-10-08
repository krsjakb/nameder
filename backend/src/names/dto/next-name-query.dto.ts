import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Gender } from '../../common/enums/gender.enum';

export class NextNameQueryDto {
  @IsUUID()
  participantId!: string;

  @IsOptional()
  @IsEnum(Gender)
  preferredGender?: Gender;
}
