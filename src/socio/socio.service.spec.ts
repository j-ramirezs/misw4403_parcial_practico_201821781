import { Test, TestingModule } from '@nestjs/testing';
import { SocioService } from './socio.service';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await repository.save({
        nombreUsuario: faker.internet.userName(),
        correoElectronico: faker.internet.email(),
        fechaNacimiento: faker.date.past(),
        clubes: [],
      });
      sociosList.push(socio);
    }
  };

  it('findAll debe retornar todos los socios', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(sociosList.length);
  });

  it('findOne debe retornar un socio por id', async () => {
    const storedSocio: SocioEntity = sociosList[0];
    const socio: SocioEntity = await service.findOne(storedSocio.id);
    expect(socio).not.toBeNull();
    expect(socio.nombreUsuario).toEqual(storedSocio.nombreUsuario);
    expect(socio.correoElectronico).toEqual(storedSocio.correoElectronico);
    expect(socio.fechaNacimiento).toEqual(storedSocio.fechaNacimiento);
  });

  it('findOne debe lanzar una excepción para un socio inválido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El socio con el id dado no existe',
    );
  });

  it('create debe retornar un nuevo socio', async () => {
    const socio: SocioEntity = {
      id: '',
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
      fechaNacimiento: faker.date.past(),
      clubes: [],
    };

    const newSocio: SocioEntity = await service.create(socio);
    expect(newSocio).not.toBeNull();

    const storedSocio: SocioEntity = await repository.findOne({
      where: { id: newSocio.id },
    });

    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombreUsuario).toEqual(newSocio.nombreUsuario);
    expect(storedSocio.correoElectronico).toEqual(newSocio.correoElectronico);
    expect(storedSocio.fechaNacimiento).toEqual(newSocio.fechaNacimiento);
  });

  it('create debe lanzar una excepción para un correo inválido', async () => {
    const socio: SocioEntity = {
      id: '',
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.lorem.sentence(),
      fechaNacimiento: faker.date.past(),
      clubes: [],
    };

    await expect(() => service.create(socio)).rejects.toHaveProperty(
      'message',
      'El correo electrónico del socio debe contener el caracter @',
    );
  });

  it('update debe modificar un socio', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.nombreUsuario = faker.internet.userName();
    socio.correoElectronico = faker.internet.email();
    const updatedSocio: SocioEntity = await service.update(socio.id, socio);
    expect(updatedSocio).not.toBeNull();
    const storedSocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombreUsuario).toEqual(socio.nombreUsuario);
    expect(storedSocio.correoElectronico).toEqual(socio.correoElectronico);
  });

  it('update debe lanzar una excepción para un socio inválido', async () => {
    let socio: SocioEntity = sociosList[0];
    socio = {
      ...socio,
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.internet.email(),
    };
    await expect(() => service.update('0', socio)).rejects.toHaveProperty(
      'message',
      'El socio con el id dado no existe',
    );
  });

  it('update debe lanzar una excepción para un correo inválido', async () => {
    let socio: SocioEntity = sociosList[0];
    socio = {
      ...socio,
      nombreUsuario: faker.internet.userName(),
      correoElectronico: faker.lorem.word(),
    };
    await expect(() => service.update(socio.id, socio)).rejects.toHaveProperty(
      'message',
      'El correo electrónico del socio debe contener el caracter @',
    );
  });

  it('delete debe eliminar un socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
    const deletedSocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(deletedSocio).toBeNull();
  });

  it('delete debe lanzar una excepción para un socio inválido', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El socio con el id dado no existe',
    );
  });
});
