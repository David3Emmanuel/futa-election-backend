import { Module } from '@nestjs/common'
import { SessionService } from './session.service'
import { Session, SessionSchema } from 'src/schemas/session.schema'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
