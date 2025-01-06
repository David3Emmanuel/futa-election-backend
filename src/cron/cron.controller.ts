import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common'
import { CronService } from './cron.service'
import { CreateJobRequest, UpdateJobRequest } from './cron.dto'

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('jobs')
  async listJobs() {
    return this.cronService.listJobs()
  }

  @Get('jobs/:jobId')
  async getJobDetails(@Param('jobId') jobId: number) {
    return this.cronService.getJobDetails(jobId)
  }

  @Post('jobs')
  async createJob(@Body() job: CreateJobRequest) {
    return this.cronService.createJob(job)
  }

  @Patch('jobs/:jobId')
  async updateJob(
    @Param('jobId') jobId: number,
    @Body() job: UpdateJobRequest,
  ) {
    return this.cronService.updateJob(jobId, job)
  }

  @Delete('jobs/:jobId')
  async deleteJob(@Param('jobId') jobId: number) {
    return this.cronService.deleteJob(jobId)
  }

  @Get('jobs/:jobId/history')
  async getJobHistory(@Param('jobId') jobId: number) {
    return this.cronService.getJobHistory(jobId)
  }

  @Get('jobs/:jobId/history/:identifier')
  async getJobHistoryDetails(
    @Param('jobId') jobId: number,
    @Param('identifier') identifier: string,
  ) {
    return this.cronService.getJobHistoryDetails(jobId, identifier)
  }
}
