/* eslint-disable prettier/prettier */
export class JwtDataDto {
  constructor(
    public id: number,
    public identity: string,
    public role: 'administrator' | 'user',
    public exp: number,
    public ip: string,
    public ua: string,
  ) {
    this.id = id;
    this.identity = identity;
    this.role = role;
    this.exp = exp;
    this.ip = ip;
    this.ua = ua;
  }
}
