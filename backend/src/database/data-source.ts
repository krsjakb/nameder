import 'reflect-metadata';
import { DataSource } from 'typeorm';
import configuration from '../config/configuration';
import { GivenName } from '../names/entities/given-name.entity';
import { Session } from '../sessions/entities/session.entity';
import { Participant } from '../sessions/entities/participant.entity';
import { Preference } from '../preferences/entities/preference.entity';
import { Rating } from '../ratings/entities/rating.entity';

const config = configuration();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize: true,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  entities: [GivenName, Session, Participant, Preference, Rating],
});

export default AppDataSource;
