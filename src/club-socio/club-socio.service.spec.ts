import { Test, TestingModule } from '@nestjs/testing';
import { ClubSocioService } from './club-socio.service';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubSocioService', () => {
  let service: ClubSocioService;
  let clubRepository: Repository<ClubEntity>;
  let socioRepository: Repository<SocioEntity>;
  let club: ClubEntity;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubSocioService],
    }).compile();

    service = module.get<ClubSocioService>(ClubSocioService);
    clubRepository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    socioRepository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    clubRepository.clear();
    socioRepository.clear();

    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await socioRepository.save({
        nombreUsuario: faker.internet.userName(),
        correoElectronico: faker.internet.email(),
        fechaNacimiento: faker.date.past(),
        clubes: [],
      });
      sociosList.push(socio);
    }

    club = await clubRepository.save({
      nombre: faker.company.name(),
      fechaFundacion: faker.date.past(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(),
      socios: sociosList,
    });

    club.socios = sociosList;
    club = await clubRepository.save(club);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub debe añadir un socio a un club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
    });

    const newClub: ClubEntity = await clubRepository.save({
      nombre: faker.company.name(),
      fechaFundacion: faker.date.past(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(),
    });

    const result: ClubEntity = await service.addMemberToClub(
      newClub.id,
      newSocio.id,
    );

    expect(result.socios.length).toBe(1);
    expect(result.socios[0]).not.toBeNull();
    expect(result.socios[0].nombreUsuario).toBe(newSocio.nombreUsuario);
    expect(result.socios[0].correoElectronico).toBe(newSocio.correoElectronico);
    expect(result.socios[0].fechaNacimiento).toStrictEqual(
      newSocio.fechaNacimiento,
    );
  });

  it('addMemberToClub debe lanzar una excepción para un socio inválido', async () => {
    const newClub: ClubEntity = await clubRepository.save({
      nombre: faker.company.name(),
      fechaFundacion: faker.date.past(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence(),
    });

    await expect(() =>
      service.addMemberToClub(newClub.id, '0'),
    ).rejects.toHaveProperty('message', 'El socio con el id dado no existe');
  });

  it('addMemberToClub debe lanzar una excepción para un club inválido', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
    });

    await expect(() =>
      service.addMemberToClub('0', newSocio.id),
    ).rejects.toHaveProperty('message', 'El club con el id dado no existe');
  });

  it('findMembersFromClub debe retornar los socios por club', async () => {
    const socios: SocioEntity[] = await service.findMembersFromClub(club.id);
    expect(socios.length).toBe(5);
  });

  it('findMembersFromClub debe lanzar una excepción para un club inválido', async () => {
    await expect(() => service.findMembersFromClub('0')).rejects.toHaveProperty(
      'message',
      'El club con el id dado no existe',
    );
  });

  it('findMemberFromClub debe retornar un socio por club', async () => {
    const socio: SocioEntity = sociosList[0];
    const storedSocio: SocioEntity = await service.findMemberFromClub(
      club.id,
      socio.id,
    );
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombreUsuario).toBe(socio.nombreUsuario);
    expect(storedSocio.correoElectronico).toBe(socio.correoElectronico);
    expect(storedSocio.fechaNacimiento).toStrictEqual(socio.fechaNacimiento);
  });

  it('findMemberFromClub debe lanzar una excepción para un socio inválido', async () => {
    await expect(() =>
      service.findMemberFromClub(club.id, '0'),
    ).rejects.toHaveProperty('message', 'El socio con el id dado no existe');
  });

  it('findMemberFromClub debe lanzar una excepción para un club inválido', async () => {
    const socio: SocioEntity = sociosList[0];
    await expect(() =>
      service.findMemberFromClub('0', socio.id),
    ).rejects.toHaveProperty('message', 'El club con el id dado no existe');
  });

  it('findMemberFromClub debe lanzar una excepción para un socio no asociado al club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
    });

    await expect(() =>
      service.findMemberFromClub(club.id, newSocio.id),
    ).rejects.toHaveProperty(
      'message',
      'El socio con el id dado no está asociado con el club',
    );
  });

  it('updateMembersFromClub debe actualizar la lista de socios para un club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
    });

    const updatedClub: ClubEntity = await service.updateMembersFromClub(
      club.id,
      [newSocio],
    );
    expect(updatedClub.socios.length).toBe(1);
    expect(updatedClub.socios[0].nombreUsuario).toBe(newSocio.nombreUsuario);
    expect(updatedClub.socios[0].correoElectronico).toBe(
      newSocio.correoElectronico,
    );
    expect(updatedClub.socios[0].fechaNacimiento).toStrictEqual(
      newSocio.fechaNacimiento,
    );
  });

  it('updateMembersFromClub debe lanzar una excepción para un club inválido', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
    });

    await expect(() =>
      service.updateMembersFromClub('0', [newSocio]),
    ).rejects.toHaveProperty('message', 'El club con el id dado no existe');
  });

  it('updateMembersFromClub debe lanzar una excepción para un socio inválido', async () => {
    const newSocio: SocioEntity = sociosList[0];
    newSocio.id = '0';

    await expect(() =>
      service.updateMembersFromClub(club.id, [newSocio]),
    ).rejects.toHaveProperty('message', 'El socio con el id dado no existe');
  });

  it('deleteMemberFromClub debe eliminar un socio de un club', async () => {
    const socio: SocioEntity = sociosList[0];

    await service.deleteMemberFromClub(club.id, socio.id);

    const storedClub: ClubEntity = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['socios'],
    });
    const deletedSocio: SocioEntity = storedClub.socios.find(
      (a) => a.id === socio.id,
    );

    expect(deletedSocio).toBeUndefined();
    expect(storedClub.socios.length).toBe(4);
  });

  it('deleteMemberFromClub debe lanzar una excepción para un socio inválido', async () => {
    await expect(() =>
      service.deleteMemberFromClub(club.id, '0'),
    ).rejects.toHaveProperty('message', 'El socio con el id dado no existe');
  });

  it('deleteMemberFromClub debe lanzar una excepción para un club inválido', async () => {
    const socio: SocioEntity = sociosList[0];
    await expect(() =>
      service.deleteMemberFromClub('0', socio.id),
    ).rejects.toHaveProperty('message', 'El club con el id dado no existe');
  });

  it('deleteMemberFromClub debe lanzar una excepción para un socio no asociado al club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
    });

    await expect(() =>
      service.deleteMemberFromClub(club.id, newSocio.id),
    ).rejects.toHaveProperty(
      'message',
      'El socio con el id dado no está asociado con el club',
    );
  });
});
