import { readFileSync } from 'fs';
import { resolve } from 'path';
import AppDataSource from '../database/data-source';
import { GivenName } from '../names/entities/given-name.entity';
import { Gender } from '../common/enums/gender.enum';
import {
  estimateSyllableCount,
  normalizeHungarianText,
  scoreNameForLastName,
} from '../common/utils/text';

function loadNames(relativePath: string): string[] {
  const absolutePath = resolve(
    __dirname,
    '../../node_modules/hungarian-names',
    relativePath,
  );
  const raw = readFileSync(absolutePath, 'utf-8');
  const json = JSON.parse(raw) as { names?: unknown[] };
  if (Array.isArray(json.names)) {
    return json.names.flatMap((entry: unknown): string[] => {
      if (Array.isArray(entry)) {
        return entry as string[];
      }
      if (typeof entry === 'string') {
        return [entry];
      }
      return [];
    });
  }
  return [];
}

async function seed() {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(GivenName);

  const maleNames = loadNames('names/ferfinevek.json');
  const femaleNames = loadNames('names/noinevek.json');

  await AppDataSource.manager.query(
    'TRUNCATE TABLE "preferences", "ratings", "given_names" RESTART IDENTITY CASCADE',
  );

  const defaultLastName = 'Kovács';
  const nameMap = new Map<string, GivenName>();

  const registerName = (rawName: string, gender: Gender) => {
    const trimmed = rawName.trim();
    if (!trimmed) return;
    const existing = nameMap.get(trimmed);
    if (existing) {
      if (existing.gender !== gender) {
        existing.gender = Gender.UNISEX;
      }
      return;
    }
    const entity = repository.create({
      value: trimmed,
      normalizedValue: normalizeHungarianText(trimmed),
      gender,
      syllableCount: estimateSyllableCount(trimmed),
      baseScore: scoreNameForLastName(trimmed, defaultLastName),
    });
    nameMap.set(trimmed, entity);
  };

  maleNames.forEach((name) => registerName(name, Gender.MALE));
  femaleNames.forEach((name) => registerName(name, Gender.FEMALE));

  const entities = Array.from(nameMap.values());

  await repository.save(entities);
  await AppDataSource.destroy();
  console.log(`Seeded ${entities.length} Hungarian given names.`);
}

seed().catch((error) => {
  console.error('Failed to seed names', error);
  process.exit(1);
});
