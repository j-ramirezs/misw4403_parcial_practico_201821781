import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubesList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubesList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
        nombre: faker.company.name(),
        fechaFundacion: faker.date.past(),
        imagen: faker.image.url(),
        descripcion: faker.lorem.sentence(),
      });
      clubesList.push(club);
    }
  };
});
