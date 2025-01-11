import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { EmailService } from 'src/email/email.service'
import { PublicUser } from 'src/schemas/user.schema'
import { UsersService } from 'src/users/users.service'
import { ResetPasswordRequest } from './forgot-password.controller'

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  // TODO rate limit this endpoint
  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByEmail(email)
    if (!user) return

    const resetLink = this.generateResetLink(user)
    await this.emailService.sendMail(
      [{ address: email }],
      'Reset your password',
      `Hello,\n\n` +
        `You requested to reset your password. ` +
        `Please click the link below to reset your password.\n\n` +
        `${resetLink}\n\n` +
        `If you did not request this, please ignore this email.\n\n` +
        `Thank you!`,
    )
  }

  private generateResetLink(user: PublicUser) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')
    const token = this.jwtService.sign({ ...user, type: 'reset' })
    return `${frontendUrl}/reset-password?token=${token}`
  }

  async resetPassword(
    user: PublicUser,
    { email, password }: ResetPasswordRequest,
  ) {
    if (user.email !== email) throw new ForbiddenException()
    await this.usersService.updatePassword(user, password)
  }
}
