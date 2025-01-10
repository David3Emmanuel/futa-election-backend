import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PublicUser } from 'src/schemas/user.schema'

@Injectable()
export class JWTResetStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  async validate(
    payload: Payload & { iat: number; exp: number },
  ): Promise<PublicUser> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, type, ...rest } = payload
    return rest satisfies PublicUser

    // FIXME: This is a temporary solution. Verify that the user exists.
  }
}

export interface Payload extends PublicUser {
  type: 'reset'
}
