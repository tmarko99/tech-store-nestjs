/* eslint-disable prettier/prettier */
export class LoginResponseDto {
  constructor(
    public id: number,
    public identity: string,
    public token: string,
  ) {
    this.id = id;
    this.identity = identity;
    this.token = token;
  }
}
