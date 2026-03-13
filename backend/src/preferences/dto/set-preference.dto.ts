import { IsEnum, IsUUID } from 'class-validator';
import { PreferenceValue } from '../../common/enums/preference-value.enum';

export class SetPreferenceDto {
  @IsUUID()
  nameId!: string;

  @IsEnum(PreferenceValue)
  value!: PreferenceValue;

  @IsUUID()
  participantId!: string;
}
