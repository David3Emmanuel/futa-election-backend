import { ConfigurableModuleBuilder } from '@nestjs/common'
import { EmailModuleOptions } from './email.types'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<EmailModuleOptions>().build()
