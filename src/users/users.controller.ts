import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard'
import { PublicUser } from 'src/schemas/user.schema'
import { UsersService } from './users.service'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.getUsers()
  }

  @Get('check')
  async checkUserExists(@Query('email') email: string) {
    const user = await this.usersService.getUserByEmail(email)
    return (user || false) && true
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getCurrentUser(@Request() req: Request & { user: PublicUser }) {
    const user = await this.usersService.getUserByEmail(req.user.email)
    return user || { success: false, message: 'User does not exist' }
  }
}
