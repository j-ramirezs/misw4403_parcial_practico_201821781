import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly nombreUsuario: string;

  @IsEmail()
  @IsNotEmpty()
  readonly correoElectronico: string;

  @IsDate()
  @IsNotEmpty()
  readonly fechaNacimiento: Date;
}
