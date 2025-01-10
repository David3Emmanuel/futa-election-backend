import {
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard'
import { LoginDTO, SignUpDTO } from './auth.dto'
import { PublicUser } from 'src/schemas/user.schema'
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { JWTAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDTO })
  login(@Request() req: Request & { user: PublicUser }) {
    return this.authService.login(req.user)
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDTO) {
    await this.authService.createUser(signUpDto)
    return { message: 'Success' }
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async logout(@Request() req: Request & { user: PublicUser }) {
    return this.authService.logout(req.user)
  }
}
