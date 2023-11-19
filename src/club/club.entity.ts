import { SocioEntity } from '../socio/socio.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  fechaFundacion: Date;

  @Column()
  imagen: string;

  @Column()
  descripcion: string;

  @ManyToMany(() => SocioEntity, (socios) => socios.clubes)
  @JoinTable()
  socios: SocioEntity[];
}
