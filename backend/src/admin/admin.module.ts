import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Session } from '../sessions/entities/session.entity';
import { Participant } from '../sessions/entities/participant.entity';
import { Preference } from '../preferences/entities/preference.entity';
import { GivenName } from '../names/entities/given-name.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Participant, Preference, GivenName]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
