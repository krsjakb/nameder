import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { RatingsService } from './services/ratings.service';
import { RatingsController } from './controllers/ratings.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { Preference } from '../preferences/entities/preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Preference]), SessionsModule],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule {}
