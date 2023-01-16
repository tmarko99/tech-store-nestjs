/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class UserRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
