/* eslint-disable prettier/prettier */
export class LoginResponseDto {
  constructor(
    public id: number,
    public identity: string,
    public token: string,
    public refreshToken: string,
    public refreshTokenExpiresAt: string,
  ) {
    this.id = id;
    this.identity = identity;
    this.token = token;
    refreshToken = refreshToken,
    refreshTokenExpiresAt = refreshTokenExpiresAt
  }
}
