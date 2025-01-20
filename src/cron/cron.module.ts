import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { ConfigurableModuleClass } from './cron.module-definition'

@Module({
  providers: [CronService],
  exports: [CronService],
})
export class CronModule extends ConfigurableModuleClass {}
