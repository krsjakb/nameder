import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NamesService } from './services/names.service';
import { NamesController } from './names.controller';
import { GivenName } from './entities/given-name.entity';
import { Session } from '../sessions/entities/session.entity';
import { Preference } from '../preferences/entities/preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GivenName, Session, Preference])],
  providers: [NamesService],
  controllers: [NamesController],
  exports: [NamesService],
})
export class NamesModule {}
