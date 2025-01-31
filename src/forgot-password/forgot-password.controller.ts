import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ForgotPasswordService } from './forgot-password.service'
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger'
import { JWTResetGuard } from './jwt-reset.guard'
import { PublicUser } from 'src/schemas/user.schema'
import { IsNotEmpty } from 'class-validator'

class ForgotPasswordRequest {
  @ApiProperty() email: string
}

export class ResetPasswordRequest {
  @ApiProperty() @IsNotEmpty() password: string
}

@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private service: ForgotPasswordService) {}

  @Post()
  async forgotPassword(@Body() body: ForgotPasswordRequest) {
    await this.service.forgotPassword(body.email)
    return {
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
