import { HttpException, Inject, Injectable } from '@nestjs/common'
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend'
import { EmailModuleOptions } from './email.types'
import { MODULE_OPTIONS_TOKEN } from './email.module-definition'

export interface EmailError {
  headers: any
  body: {
    message: string
    errors: any
  }
  statusCode: number
}

@Injectable()
export class EmailService {
  mailerSend: MailerSend
  sender: Sender

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: EmailModuleOptions) {
    if (!options.apiKey) {
      throw new Error('MAILERSEND_API_KEY is required')
    }

    this.mailerSend = new MailerSend({ apiKey: options.apiKey })
    this.sender = new Sender(
      `noreply@${options.senderDomain}`,
      options.senderName,
    )
  }

  private async _sendMail(emailParams: EmailParams) {
    try {
      return await this.mailerSend.email.send(emailParams)
    } catch (e) {
      // console.error(e)
      throw new HttpException(
        e.body.message || 'Failed to send email',
        e.statusCode || 500,
      )
    }
  }

  async sendMail(to: string, subject: string, text: string) {
    const recipient = new Recipient(to)

    const emailParams = new EmailParams()
      .setFrom(this.sender)
      .setSubject(subject)
      .setText(text)
      .setTo([recipient])

    return await this._sendMail(emailParams)
  }

  async sendMailWithTemplate(
    to: string,
    subject: string,
    templateId: string,
    personalization: any,
  ) {
    const recipient = new Recipient(to)

    const emailParams = new EmailParams()
      .setFrom(this.sender)
      .setSubject(subject)
      .setTemplateId(templateId)
      .setPersonalization([personalization])
      .setTo([recipient])

    return await this._sendMail(emailParams)
  }
}
