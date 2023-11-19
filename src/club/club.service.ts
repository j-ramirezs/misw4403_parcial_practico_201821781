import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from './club.entity';
import { Repository } from 'typeorm/repository/Repository';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  async findAll(): Promise<ClubEntity[]> {
    return await this.clubRepository.find({ relations: ['socios'] });
  }

  async findOne(id: string): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no existe',
        BusinessError.NOT_FOUND,
      );

    return club;
  }

  async create(club: ClubEntity): Promise<ClubEntity> {
    if (club.descripcion.length > 100) {
      throw new BusinessLogicException(
        'La descripción del club no puede superar los 100 caracteres',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    return await this.clubRepository.save(club);
  }

  async update(id: string, club: ClubEntity): Promise<ClubEntity> {
    const persistedClub: ClubEntity = await this.clubRepository.findOne({
      where: { id },
      relations: ['socios'],
    });
    if (!persistedClub)
      throw new BusinessLogicException(
        'El club con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    if (club.descripcion && club.descripcion.length > 100) {
      throw new BusinessLogicException(
        'La descripción del club no puede superar los 100 caracteres',
        BusinessError.PRECONDITION_FAILED,
      );
    }
    return await this.clubRepository.save({ ...persistedClub, ...club });
  }

  async delete(id: string) {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    await this.clubRepository.remove(club);
  }
}
