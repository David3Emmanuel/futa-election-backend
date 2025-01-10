import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ForgotPasswordService } from './forgot-password.service'
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger'
import { JWTResetGuard } from './jwt-reset.guard'
import { PublicUser } from 'src/schemas/user.schema'
import { IsEmail, IsNotEmpty } from 'class-validator'

class ForgotPasswordRequest {
  @ApiProperty() email: string
}

export class ResetPasswordRequest {
  @ApiProperty() @IsEmail() email: string
  @ApiProperty() @IsNotEmpty() password: string
}

@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private service: ForgotPasswordService) {}

  @Post()
  async forgotPassword(@Body() body: ForgotPasswordRequest) {
    const res = await this.service.forgotPassword(body.email)
    return {
      ...res,
      message: 'A request link has been sent if this email exists.',
    }
  }

  @UseGuards(JWTResetGuard)
  @ApiBearerAuth()
  @Post('reset')
  async resetPassword(
    @Body() body: ResetPasswordRequest,
    @Request() req: Request & { user: PublicUser },
  ) {
    await this.service.resetPassword(req.user, body)
    return { message: 'Password reset successful. Please login.' }
  }
}
