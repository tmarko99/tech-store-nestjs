/* eslint-disable prettier/prettier */
export class LoginResponseDto {
  constructor(
    public administratorId: number,
    public username: string,
    public token: string,
  ) {
    this.administratorId = administratorId;
    this.username = username;
    this.token = token;
  }
}
