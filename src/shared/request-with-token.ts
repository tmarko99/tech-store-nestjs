/* eslint-disable prettier/prettier */
import { JwtDataDto } from '../auth/dto/jwt-data.dto';

declare module 'express' {
  interface Request {
    token: JwtDataDto;
  }
}
