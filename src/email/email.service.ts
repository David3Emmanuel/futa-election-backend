import { Inject, Injectable } from '@nestjs/common'
import { MailerSend, Sender } from 'mailersend'
import { EmailModuleOptions } from './email.types'
import { MODULE_OPTIONS_TOKEN } from './email.module-definition'

@Injectable()
export class EmailService {
  mailerSend: MailerSend
  sender: Sender

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: EmailModuleOptions) {
    if (!options.apiKey) {
      throw new Error('MAILERSEND_API_KEY is required')
    }

    this.mailerSend = new MailerSend({ apiKey: options.apiKey })
    this.sender = new Sender(options.senderDomain, options.senderName)
  }
}
