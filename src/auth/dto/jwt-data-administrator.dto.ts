/* eslint-disable prettier/prettier */
export class JwtDataAdministratorDto {
  constructor(
    public administratorId: number,
    public username: string,
    public ext: number,
    public ip: string,
    public ua: string,
  ) {
    this.administratorId = administratorId;
    this.username = username;
    this.ext = ext;
    this.ip = ip;
    this.ua = ua;
  }
}
