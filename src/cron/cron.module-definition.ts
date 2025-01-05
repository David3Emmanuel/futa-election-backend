import { ConfigurableModuleBuilder } from '@nestjs/common'
import { CronModuleOptions } from './cron.types'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CronModuleOptions>().build()
