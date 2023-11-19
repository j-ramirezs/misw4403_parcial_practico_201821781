import { IsEmail, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly nombreUsuario: string;

  @IsEmail()
  @IsNotEmpty()
  readonly correoElectronico: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly fechaNacimiento: Date;
}
