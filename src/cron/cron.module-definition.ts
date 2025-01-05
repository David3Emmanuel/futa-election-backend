import { ConfigurableModuleBuilder } from '@nestjs/common'

export interface CronModuleOptions {
  apiKey: string
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CronModuleOptions>().build()
