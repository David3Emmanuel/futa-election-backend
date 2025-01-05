import { Inject, Injectable } from '@nestjs/common'
import {
  CronModuleOptions,
  MODULE_OPTIONS_TOKEN,
} from './cron.module-definition'
import { codes } from './status-codes'

const BASE_URL = 'https://api.cron-job.org'

@Injectable()
export class CronService {
  apiKey: string

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: CronModuleOptions) {
    if (!options.apiKey) throw new Error('CRONJOB_API_KEY is required')
    this.apiKey = options.apiKey
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
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

    return await response.json()
  }
}
