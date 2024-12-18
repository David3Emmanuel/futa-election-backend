import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JWTVoteGuard extends AuthGuard('jwt-vote') {}
