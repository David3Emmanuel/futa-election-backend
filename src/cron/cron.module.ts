import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { ConfigurableModuleClass } from './cron.module-definition'
import { CronController } from './cron.controller';

@Module({
  providers: [CronService],
  exports: [CronService],
  controllers: [CronController],
})
export class CronModule extends ConfigurableModuleClass {}
