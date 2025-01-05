import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum JobStatus {
  Unknown = 0,
  OK = 1,
  FailedDnsError = 2,
  FailedConnectionError = 3,
  FailedHttpError = 4,
  FailedTimeout = 5,
  FailedTooMuchData = 6,
  FailedInvalidUrl = 7,
  FailedInternalError = 8,
  FailedUnknownReason = 9,
}

export enum JobType {
  Default = 0,
  Monitoring = 1,
}

export enum RequestMethod {
  GET = 0,
  POST = 1,
  OPTIONS = 2,
  HEAD = 3,
  PUT = 4,
  DELETE = 5,
  TRACE = 6,
  CONNECT = 7,
  PATCH = 8,
}

export class Job {
  @ApiProperty({ description: 'Job identifier' })
  @IsInt()
  jobId: number

  @ApiProperty({ description: 'Whether the job is enabled' })
  @IsBoolean()
  enabled: boolean

  @ApiProperty({ description: 'Job title' })
  @IsString()
  title: string

  @ApiProperty({ description: 'Whether to save job response header/body' })
  @IsBoolean()
  saveResponses: boolean

  @ApiProperty({ description: 'Job URL' })
  @IsString()
  url: string

  @ApiProperty({ description: 'Last execution status', enum: JobStatus })
  @IsInt()
  lastStatus: JobStatus

  @ApiProperty({ description: 'Last execution duration in milliseconds' })
  @IsInt()
  lastDuration: number

  @ApiProperty({ description: 'Unix timestamp of last execution (in seconds)' })
  @IsInt()
  lastExecution: number

  @ApiProperty({
    description: 'Unix timestamp of predicted next execution (in seconds)',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  nextExecution: number | null

  @ApiProperty({ description: 'Job type', enum: JobType })
  @IsInt()
  type: JobType

  @ApiProperty({ description: 'Job timeout in seconds' })
  @IsInt()
  requestTimeout: number

  @ApiProperty({ description: 'Whether to treat HTTP 3xx as success' })
  @IsBoolean()
  redirectSuccess: boolean

  @ApiProperty({ description: 'Folder identifier' })
  @IsInt()
  folderId: number

  @ApiProperty({ description: 'Job schedule', type: () => JobSchedule })
  @ValidateNested()
  @Type(() => JobSchedule)
  schedule: JobSchedule

  @ApiProperty({ description: 'HTTP request method', enum: RequestMethod })
  @IsInt()
  requestMethod: RequestMethod
}

export class DetailedJob extends Job {
  @ApiProperty({
    description: 'HTTP authentication settings',
    type: () => JobAuth,
  })
  @ValidateNested()
  @Type(() => JobAuth)
  auth: JobAuth

  @ApiProperty({
    description: 'Notification settings',
    type: () => JobNotificationSettings,
  })
  @ValidateNested()
  @Type(() => JobNotificationSettings)
  notification: JobNotificationSettings

  @ApiProperty({
    description: 'Extended request data',
    type: () => JobExtendedData,
  })
  @ValidateNested()
  @Type(() => JobExtendedData)
  extendedData: JobExtendedData
}

export class JobAuth {
  @ApiProperty({ description: 'Enable HTTP basic authentication' })
  @IsBoolean()
  enable: boolean

  @ApiProperty({ description: 'HTTP basic auth username' })
  @IsString()
  user: string

  @ApiProperty({ description: 'HTTP basic auth password' })
  @IsString()
  password: string
}

export class JobNotificationSettings {
  @ApiProperty({ description: 'Notify on job failure' })
  @IsBoolean()
  onFailure: boolean

  @ApiProperty({ description: 'Notify on job success after failure' })
  @IsBoolean()
  onSuccess: boolean

  @ApiProperty({ description: 'Notify on job auto-disable' })
  @IsBoolean()
  onDisable: boolean
}

export class JobExtendedData {
  @ApiProperty({ description: 'Request headers', type: Object })
  @IsObject()
  headers: Record<string, string>

  @ApiProperty({ description: 'Request body data' })
  @IsString()
  body: string
}

export class JobSchedule {
  @ApiProperty({ description: 'Schedule time zone' })
  @IsString()
  timezone: string

  @ApiProperty({ description: 'Expiration time (format: YYYYMMDDhhmmss)' })
  @IsInt()
  expiresAt: number

  @ApiProperty({ description: 'Execution hours', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  hours: number[]

  @ApiProperty({ description: 'Execution days of month', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  mdays: number[]

  @ApiProperty({ description: 'Execution minutes', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  minutes: number[]

  @ApiProperty({ description: 'Execution months', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  months: number[]

  @ApiProperty({ description: 'Execution days of week', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  wdays: number[]
}

export class HistoryItem {
  @ApiProperty({ description: 'Identifier of the associated cron job' })
  @IsInt()
  jobId: number

  @ApiProperty({ description: 'Identifier of the history item' })
  @IsString()
  identifier: string

  @ApiProperty({
    description: 'Unix timestamp (in seconds) of the actual execution',
  })
  @IsInt()
  date: number

  @ApiProperty({
    description: 'Unix timestamp (in seconds) of the planned/ideal execution',
  })
  @IsInt()
  datePlanned: number

  @ApiProperty({ description: 'Scheduling jitter in milliseconds' })
  @IsInt()
  jitter: number

  @ApiProperty({ description: 'Job URL at time of execution' })
  @IsString()
  url: string

  @ApiProperty({ description: 'Actual job duration in milliseconds' })
  @IsInt()
  duration: number

  @ApiProperty({ description: 'Status of execution', enum: JobStatus })
  @IsInt()
  status: JobStatus

  @ApiProperty({ description: 'Detailed job status description' })
  @IsString()
  statusText: string

  @ApiProperty({ description: 'HTTP status code returned by the host, if any' })
  @IsInt()
  httpStatus: number

  @ApiProperty({
    description:
      'Raw response headers returned by the host (null if unavailable)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  headers: string | null

  @ApiProperty({
    description: 'Raw response body returned by the host (null if unavailable)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  body: string | null

  @ApiProperty({
    description: 'Additional timing information for this request',
    type: () => HistoryItemStats,
  })
  @ValidateNested()
  @Type(() => HistoryItemStats)
  stats: HistoryItemStats
}

export class HistoryItemStats {
  @ApiProperty({
    description:
      'Time from transfer start until name lookups completed (in microseconds)',
  })
  @IsInt()
  nameLookup: number

  @ApiProperty({
    description:
      'Time from transfer start until socket connect completed (in microseconds)',
  })
  @IsInt()
  connect: number

  @ApiProperty({
    description:
      'Time from transfer start until SSL handshake completed (in microseconds) - 0 if not using SSL',
  })
  @IsInt()
  appConnect: number

  @ApiProperty({
    description:
      'Time from transfer start until beginning of data transfer (in microseconds)',
  })
  @IsInt()
  preTransfer: number

  @ApiProperty({
    description:
      'Time from transfer start until the first response byte is received (in microseconds)',
  })
  @IsInt()
  startTransfer: number

  @ApiProperty({ description: 'Total transfer time (in microseconds)' })
  @IsInt()
  total: number
}
