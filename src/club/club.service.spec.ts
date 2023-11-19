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
        socios: [],
      });
      clubesList.push(club);
    }
  };

  it('findAll debe retornar todos los clubes', async () => {
    const clubes: ClubEntity[] = await service.findAll();
    expect(clubes).not.toBeNull();
    expect(clubes).toHaveLength(clubesList.length);
  });

  it('findOne debe retornar un club por id', async () => {
    const storedClub: ClubEntity = clubesList[0];
    const club: ClubEntity = await service.findOne(storedClub.id);
    expect(club).not.toBeNull();
    expect(club.nombre).toEqual(storedClub.nombre);
    expect(club.fechaFundacion).toEqual(storedClub.fechaFundacion);
    expect(club.imagen).toEqual(storedClub.imagen);
    expect(club.descripcion).toEqual(storedClub.descripcion);
  });

  it('findOne debe lanzar una excepción para un club inválido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El club con el id dado no existe',
    );
  });

  it('create debe retornar un nuevo club', async () => {
    const club: ClubEntity = {
      id: '',
      nombre: faker.company.name(),
      fechaFundacion: faker.date.past(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(),
      socios: [],
    };

    const newClub: ClubEntity = await service.create(club);
    expect(newClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: newClub.id },
    });

    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(newClub.nombre);
    expect(storedClub.fechaFundacion).toEqual(newClub.fechaFundacion);
    expect(storedClub.imagen).toEqual(newClub.imagen);
    expect(storedClub.descripcion).toEqual(newClub.descripcion);
  });

  it('create debe lanzar una excepción para una descripción inválida', async () => {
    const club: ClubEntity = {
      id: '',
      nombre: faker.company.name(),
      fechaFundacion: faker.date.past(),
      imagen: faker.image.url(),
      descripcion: faker.string.sample(150),
      socios: [],
    };

    await expect(() => service.create(club)).rejects.toHaveProperty(
      'message',
      'La descripción del club no puede superar los 100 caracteres',
    );
  });

  it('update debe modificar un club', async () => {
    const club: ClubEntity = clubesList[0];
    club.nombre = faker.company.name();
    club.descripcion = faker.lorem.sentence();
    const updatedClub: ClubEntity = await service.update(club.id, club);
    expect(updatedClub).not.toBeNull();
    const storedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(club.nombre);
    expect(storedClub.descripcion).toEqual(club.descripcion);
  });

  it('update debe lanzar una excepción para un club inválido', async () => {
    let club: ClubEntity = clubesList[0];
    club = {
      ...club,
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
    };
    await expect(() => service.update('0', club)).rejects.toHaveProperty(
      'message',
      'El club con el id dado no existe',
    );
  });

  it('update debe lanzar una excepción para una descripción inválida', async () => {
    let club: ClubEntity = clubesList[0];
    club = {
      ...club,
      nombre: faker.company.name(),
      descripcion: faker.string.sample(150),
    };
    await expect(() => service.update(club.id, club)).rejects.toHaveProperty(
      'message',
      'La descripción del club no puede superar los 100 caracteres',
    );
  });

  it('delete debe eliminar un club', async () => {
    const club: ClubEntity = clubesList[0];
    await service.delete(club.id);
    const deletedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(deletedClub).toBeNull();
  });

  it('delete debe lanzar una excepción para un club inválido', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El club con el id dado no existe',
    );
  });
});
