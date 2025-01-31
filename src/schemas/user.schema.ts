import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document, HydratedDocument, Types } from 'mongoose'

export type PublicUser = Omit<User, 'passwordHash'> & {
  _id: Types.ObjectId
}

@Schema()
export class User {
  @ApiProperty()
  @Prop({ required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
  email: string
  @ApiProperty() @Prop({ required: true }) username: string
  @ApiProperty() @Prop({ required: true }) passwordHash: string
}

export function extractUser(userDocument: Document<unknown, object, User>) {
  return userDocument.toObject({ versionKey: false })
}

export function asPublicUser(
  user: User & {
    _id: Types.ObjectId
  },
): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user
  return rest
}

export const UserSchema = SchemaFactory.createForClass(User)

export type UserDocument = HydratedDocument<User>
