import { IsISO8601, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly fechaFundacion: Date;

  @IsUrl()
  @IsNotEmpty()
  readonly imagen: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;
}
