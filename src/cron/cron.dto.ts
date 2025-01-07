import { ApiProperty, PartialType, PickType } from '@nestjs/swagger'
import { Job, DetailedJob, HistoryItem } from './cron.types'
import { IsArray, IsBoolean, IsInt } from 'class-validator'

export class ListJobsResponse {
  @ApiProperty({
    type: [Job],
    description: 'List of jobs present in the account',
  })
  @IsArray()
  jobs: Job[]

  @ApiProperty({
    type: Boolean,
    description:
      'True in case some jobs could not be retrieved because of internal errors and the list might be incomplete, otherwise false',
  })
  @IsBoolean()
  someFailed: boolean
}

export class JobDetailsResponse {
  @ApiProperty({
    type: [DetailedJob],
    description: 'Job details',
  })
  @IsArray()
  jobDetails: DetailedJob[]
}

export class CreateJobResponse {
  @ApiProperty({
    type: Number,
    description: 'Identifier of the created job',
  })
  @IsInt()
  jobId: number
}

export class JobHistoryResponse {
  @ApiProperty({
    type: [HistoryItem],
    description: 'The last execution history items',
  })
  @IsArray()
  history: HistoryItem[]

  @ApiProperty({
    type: [Number],
    description:
      'Unix timestamps (in seconds) of the predicted next executions (up to 3)',
  })
  @IsArray()
  @IsInt({ each: true })
  predictions: number[]
}

export class JobHistoryDetailsResponse {
  @ApiProperty({
    type: HistoryItem,
    description: 'History item',
  })
  jobHistoryDetails: HistoryItem
}

export class UpdateJobRequest extends PartialType(DetailedJob) {}

export class CreateJobRequest extends PickType(DetailedJob, [
  'title',
  'url',
  'enabled',
  'saveResponses',
  'schedule',
  'extendedData',
]) {}
