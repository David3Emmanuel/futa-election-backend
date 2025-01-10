import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JWTResetGuard extends AuthGuard('jwt-reset') {}
