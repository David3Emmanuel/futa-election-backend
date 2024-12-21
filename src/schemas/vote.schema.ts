import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class Vote {
  @ApiProperty() voterId: string
  @ApiProperty() candidateId: string
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
