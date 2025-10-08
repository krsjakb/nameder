import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { validate } from './config/validation';
import { NamesModule } from './names/names.module';
import { SessionsModule } from './sessions/sessions.module';
import { PreferencesModule } from './preferences/preferences.module';
import { RatingsModule } from './ratings/ratings.module';
import { GivenName } from './names/entities/given-name.entity';
import { Session } from './sessions/entities/session.entity';
import { Participant } from './sessions/entities/participant.entity';
import { Preference } from './preferences/entities/preference.entity';
import { Rating } from './ratings/entities/rating.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          synchronize: dbConfig.synchronize ?? false,
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
          entities: [GivenName, Session, Participant, Preference, Rating],
          autoLoadEntities: true,
        };
      },
    }),
    NamesModule,
    SessionsModule,
    PreferencesModule,
    RatingsModule,
  ],
})
export class AppModule {}
