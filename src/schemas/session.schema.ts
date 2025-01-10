import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document, HydratedDocument, Types } from 'mongoose'

@Schema()
export class Session {
  @Prop({ required: true })
  @ApiProperty()
  userId: string

  @Prop({ required: true })
  @ApiProperty()
  accessToken: string
}

export class SessionWithId extends Session {
  _id: Types.ObjectId
}

export function extractSession(
  sessionDocument: Document<unknown, object, Session>,
) {
  return sessionDocument.toObject({ versionKey: false }) as SessionWithId
}

export const SessionSchema = SchemaFactory.createForClass(Session)

export type SessionDocument = HydratedDocument<Session>
