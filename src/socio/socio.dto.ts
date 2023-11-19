import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly nombreUsuario: string;

  @IsString()
  @IsNotEmpty()
  readonly correoElectronico: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly fechaNacimiento: Date;
}
