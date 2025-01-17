import { HttpException, Inject, Injectable } from '@nestjs/common'
import { EmailModuleOptions } from './email.types'
import { MODULE_OPTIONS_TOKEN } from './email.module-definition'

@Injectable()
export class EmailService {
  authorization: string

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: EmailModuleOptions) {
    if (!options.auth) {
      throw new Error('BREVO_API_KEY is required')
    }
    this.authorization = options.auth
  }

  async sendMail(to: string, templateId: number, params: object) {
    let res
    while (!res) {
      try {
        res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': this.authorization,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            params,
            templateId,
            to: [{ email: to }],
          }),
        })
      } catch (e) {
        console.error(e)
        console.warn('Retrying...')
      }
    }
    if (res.ok) return await res.json()
    else {
      try {
        const error = await res.json()
        console.error(error)
        throw new HttpException(error, res.status)
      } catch (e) {
        console.error(e)
        throw new HttpException('An error occurred', res.status)
      }
    }
  }
}
