import { HttpException, Inject, Injectable } from '@nestjs/common'
import { EmailModuleOptions } from './email.types'
import { MODULE_OPTIONS_TOKEN } from './email.module-definition'

@Injectable()
export class EmailService {
  authorization: string

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: EmailModuleOptions) {
    if (!options.auth) {
      throw new Error('ZEPTOMAIL_AUTH is required')
    }
    this.authorization = options.auth
  }

  async sendMail(
    to: { address: string; name?: string }[],
    subject: string,
    htmlbody: string,
  ) {
    const body = {
      from: {
        address: 'noreply@futaaec.com',
        name: 'FUTA AEC',
      },
      to: to.map((recipient) => ({
        email_address: {
          address: recipient.address,
          name: recipient.name,
        },
      })),
      subject,
      htmlbody,
    }
    return console.log(body.to[0], { ...body, to: undefined })

    const res = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authorization,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    console.log(data)
    if (res.ok) return data
    else throw new HttpException(data, res.status)
  }
}
