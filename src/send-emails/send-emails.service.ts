import {
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ElectionService } from 'src/election/election.service'
import { ElectionWithoutVotes } from 'src/election/hideVotes'
import { EmailService } from 'src/email/email.service'
import { isActive } from 'src/schemas/election.schema'
import { VoteService } from 'src/vote/vote.service'
import { VoterService } from 'src/voter/voter.service'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'queue-typescript'

@Injectable()
export class SendEmailsService {
  private readonly frontendUrl: string

  constructor(
    private readonly electionService: ElectionService,
    private readonly voteService: VoteService,
    private readonly emailService: EmailService,
    private readonly voterService: VoterService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')
  }

  formatDateTime(date: Date) {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Africa/Lagos',
    })
  }

  async sendBulkReminderEmails() {
    throw new NotImplementedException()

    const election = await this.electionService.getLatestElection()
    if (!election) throw new NotFoundException('No elections found')
    if (!isActive(election))
      throw new NotFoundException('There is no active election')

    // FIXME do not send emails to voters who have already voted
    // await Promise.all(
    //   election.voterIds.map(async (voterId) => {
    //     const voter = await this.voterService.getVoterById(voterId)
    //     const token = await this.voteService.generateToken(voter)

    //     const subject = 'Reminder to vote in the ongoing election'

    // await this.emailService.sendMail(
    //   [{ address: voter.email }],
    //   subject,
    //   `Hello,\n\n` +
    //     `The election is still ongoing. ` +
    //     `Please click the link below to vote.\n\n` +
    //     `${this.frontendUrl}/vote?token=${token}\n\n` +
    //     `Election ends: ${this.formatDateTime(election.endDate)}\n\n` +
    //     `Thank you for voting!`,
    // )
    // }),
    // )
  }

  async sendBulkPreElectionEmails(election: ElectionWithoutVotes) {
    await Promise.all(
      election.voterIds.map(async (voterId) => {
        const voter = await this.voterService.getVoterById(voterId)
        const token = await this.voteService.generateToken(voter)

        await this.emailService.sendMail(voter.email, 1, {
          link: `${this.frontendUrl}/vote?token=${token}`,
          startDate: `${this.formatDateTime(election.startDate)}`,
          endDate: `${this.formatDateTime(election.endDate)}`,
        })
      }),
    )
  }

  async sendBulkPostElectionEmails(election: ElectionWithoutVotes) {
    await Promise.all(
      election.voterIds.map(async (voterId) => {
        const voter = await this.voterService.getVoterById(voterId)

        await this.emailService.sendMail(voter.email, 2, {
          endDate: this.formatDateTime(election.endDate),
        })
      }),
    )
  }

  async sendPreOrPostElectionEmails() {
    const election = await this.electionService.getLatestElection()
    if (!election) throw new NotFoundException('No elections found')

    const now = new Date().getTime()
    const startTime = election.startDate.getTime()
    const endTime = election.endDate.getTime()
    if (isActive(election) || (startTime - 3600000 < now && now < startTime)) {
      // Send pre-election emails
      console.log('Sending pre-election emails...')
      await this.sendBulkPreElectionEmails(election)
      return { message: 'Pre-election emails sent' }
    } else if (now > endTime) {
      // Send post-election emails
      console.log('Sending post-election emails...')
      await this.sendBulkPostElectionEmails(election)
      return { message: 'Post-election emails sent' }
    } else {
      throw new UnprocessableEntityException(
        'Not the right time to send emails',
      )
    }
  }

  async sendPreElectionToSelectEmails(emails: string[]) {
    const election = await this.electionService.getLatestElection()
    if (!election) throw new NotFoundException('No elections found')

    const now = new Date().getTime()
    const startTime = election.startDate.getTime()
    const endTime = election.endDate.getTime()
    if (isActive(election) || (startTime - 3600000 < now && now < startTime)) {
      // Send pre-election emails
      console.log('Resending pre-election emails...')
      await this.sendBulkPreElectionToSelectEmails(election, emails)
      return { message: 'Pre-election emails sent' }
    } else if (now > endTime) {
      // Send post-election emails
      console.log('Resending post-election emails...')
      await this.sendBulkPostElectionEmails(election)
      return { message: 'Post-election emails sent' }
    } else {
      throw new UnprocessableEntityException(
        'Not the right time to send emails',
      )
    }
  }

  async sendBulkPreElectionToSelectEmails(
    election: ElectionWithoutVotes,
    emails: string[],
  ) {
    const queue = new Queue<() => Promise<void>>()
    const totalTasks = election.voterIds.length
    console.log('Total tasks:', totalTasks)

    console.log('Queueing tasks...')
    election.voterIds.forEach((voterId) => {
      queue.enqueue(async () => {
        const voter = await this.voterService.getVoterById(voterId)
        if (!emails.includes(voter.email)) return
        const token = await this.voteService.generateToken(voter)

        await this.emailService.sendMail(voter.email, 1, {
          link: `${this.frontendUrl}/vote?token=${token}`,
          startDate: `${this.formatDateTime(election.startDate)}`,
          endDate: `${this.formatDateTime(election.endDate)}`,
        })
      })
    })

    console.log('Starting...')

    while (queue.length > 0) {
      console.log('Queue length:', queue.length)
      const task = queue.dequeue()
      await task()
    }
  }
}
