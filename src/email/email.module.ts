import { Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { ConfigurableModuleClass } from './email.module-definition'

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule extends ConfigurableModuleClass {}
