import { Module } from '@nestjs/common';
import { ClubSocioService } from './club-socio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity, SocioEntity])],
  providers: [ClubSocioService],
})
export class ClubSocioModule {}
