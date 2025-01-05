import { Inject, Injectable } from '@nestjs/common'
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
} from './cron.dto'
import { DetailedJob } from './cron.types'

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
      throw new Error(`${statusCode}: ${message}`)
    }

    return (await response.json()) as T
  }

  async listJobs() {
    return await this.fetch<ListJobsResponse>('/jobs')
  }

  async getJobDetails(jobId: string) {
    return await this.fetch<JobDetailsResponse>(`/jobs/${jobId}`)
  }

  async createJob(job: DetailedJob) {
    return await this.fetch<CreateJobResponse>('/jobs', {
      method: 'PUT',
      body: JSON.stringify({ job }),
    })
  }

  async updateJob(jobId: string, job: Partial<DetailedJob>) {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    return await this.fetch<{}>(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ job }),
    })
  }

  async deleteJob(jobId: string) {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    return await this.fetch<{}>(`/jobs/${jobId}`, {
      method: 'DELETE',
    })
  }

  async getJobHistory(jobId: string) {
    return await this.fetch<JobHistoryResponse>(`/jobs/${jobId}/history`)
  }

  async getJobHistoryDetails(jobId: string, identifier: string) {
    return await this.fetch<JobHistoryDetailsResponse>(
      `/jobs/${jobId}/history/${identifier}`,
    )
  }
}
