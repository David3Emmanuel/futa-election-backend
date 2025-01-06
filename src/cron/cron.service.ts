import { HttpException, Inject, Injectable } from '@nestjs/common'
import {
  CronModuleOptions,
  MODULE_OPTIONS_TOKEN,
} from './cron.module-definition'
import { codes } from './status-codes'
import {
  ListJobsResponse,
  JobDetailsResponse,
  CreateJobResponse,
  JobHistoryResponse,
  JobHistoryDetailsResponse,
  CreateJobRequest,
  UpdateJobRequest,
} from './cron.dto'
import { JobSchedule } from './cron.types'

const BASE_URL = 'https://api.cron-job.org'

@Injectable()
export class CronService {
  apiKey: string

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: CronModuleOptions) {
    if (!options.apiKey) throw new Error('CRONJOB_API_KEY is required')
    this.apiKey = options.apiKey
  }

  async fetch<T = unknown>(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(BASE_URL + endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const statusCode = response.status
      const message = codes[statusCode] || 'Unknown error'
      throw new HttpException(message, statusCode)
    }

    return (await response.json()) as T
  }

  async listJobs() {
    return await this.fetch<ListJobsResponse>('/jobs')
  }

  async getJobDetails(jobId: number) {
    return await this.fetch<JobDetailsResponse>(`/jobs/${jobId}`)
  }

  async createJob(job: CreateJobRequest) {
    return await this.fetch<CreateJobResponse>('/jobs', {
      method: 'PUT',
      body: JSON.stringify({ job }),
    })
  }

  async updateJob(jobId: number, job: UpdateJobRequest) {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    return await this.fetch<{}>(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ job }),
    })
  }

  async deleteJob(jobId: number) {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    return await this.fetch<{}>(`/jobs/${jobId}`, {
      method: 'DELETE',
    })
  }

  async getJobHistory(jobId: number) {
    return await this.fetch<JobHistoryResponse>(`/jobs/${jobId}/history`)
  }

  async getJobHistoryDetails(jobId: number, identifier: string) {
    return await this.fetch<JobHistoryDetailsResponse>(
      `/jobs/${jobId}/history/${identifier}`,
    )
  }

  dateToSchedule(date: Date): JobSchedule {
    const timezone = 'UTC' // Set the desired timezone
    // Job expires 10 minutes after the date
    const expiryDate = new Date(date.getTime() + 10 * 60 * 1000)
    // YYYYMMDDhhmmss
    const expiresAt = parseInt(
      expiryDate
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 12),
    )

    return {
      timezone,
      expiresAt,
      hours: [date.getUTCHours()],
      mdays: [date.getUTCDate()],
      minutes: [date.getUTCMinutes()],
      months: [date.getUTCMonth() + 1],
      wdays: [-1], // Every day of the week
    }
  }
}
