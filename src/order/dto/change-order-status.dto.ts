/* eslint-disable prettier/prettier */
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class ChangeOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['rejected', 'accepted', 'shipped', 'pending'])
  newStatus: 'rejected' | 'accepted' | 'shipped' | 'pending';
}
