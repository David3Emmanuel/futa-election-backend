import { Injectable, ConflictException } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import { LoginDTO, SignUpDTO } from './auth.dto'
import { asPublicUser, PublicUser } from 'src/schemas/user.schema'
import { SessionService } from 'src/session/session.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async validateUser({ email, password }: LoginDTO) {
    const user = await this.usersService.getRawUserByEmail(email)
    if (
      user &&
      (await this.usersService.validatePassword(password, user.passwordHash))
    ) {
      return asPublicUser(user)
    }
    return null
  }

  async createUser(userDetails: SignUpDTO) {
    const user = await this.usersService.getUserByEmail(userDetails.email)
    if (user) throw new ConflictException()
    await this.usersService.createUser(userDetails)
  }

  async login(user: PublicUser) {
    const access_token = this.jwtService.sign(user)
    await this.sessionService.createSession(user._id.toString(), access_token)
    return { access_token }
  }

  async logoutFromAll(user: PublicUser) {
    const userId = user._id.toString()
    await this.sessionService.deleteSessionsByUserId(userId)
    return { message: 'Logged out from all devices' }
  }

  async logout(user: PublicUser & { accessToken: string }) {
    const userId = user._id.toString()
    await this.sessionService.deleteSession(userId, user.accessToken)
    return { message: 'Logged out' }
  }
}
