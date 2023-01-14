/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class AddAdministratorDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z][a-z0-9\.]{3, 30}[a-z0-9]$/)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 128)
  password: string;
}
