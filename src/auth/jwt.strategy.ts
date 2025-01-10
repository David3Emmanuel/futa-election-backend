import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PublicUser } from 'src/schemas/user.schema'
import { UsersService } from 'src/users/users.service'
import { SessionService } from 'src/session/session.service'
import { Request } from 'express'

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
      passReqToCallback: true,
    })
  }

  async validate(
    req: Request,
    payload: PublicUser & { iat: number; exp: number },
  ) {
    const accessToken = req.headers.authorization?.split(' ')[1]
    if (!accessToken) return null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...rest } = payload
    const user = await this.usersService.findUserById(rest._id)
    const session = await this.sessionService.findSession(
      rest._id.toString(),
      accessToken,
    )
    if (!user || !session) return null

    return rest as PublicUser
  }
}
