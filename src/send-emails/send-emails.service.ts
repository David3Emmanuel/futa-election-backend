import { Injectable, NotFoundException } from '@nestjs/common'
import { ElectionService } from 'src/election/election.service'
import { ElectionWithoutVotes } from 'src/election/hideVotes'
import { EmailService } from 'src/email/email.service'
import { getYear, isActive } from 'src/schemas/election.schema'
import { VoteService } from 'src/vote/vote.service'
import { VoterService } from 'src/voter/voter.service'
import { ConfigService } from '@nestjs/config'

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
    // Example: Tuesday 7, January 2025 12:00 PM
    return date.toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  }

  async sendBulkReminderEmails() {
    const election = await this.electionService.getLatestElection()
    if (!election) throw new NotFoundException('No elections found')
    if (!isActive(election))
      throw new NotFoundException('There is no active election')

    // FIXME do not send emails to voters who have already voted
    election.voterIds.forEach(async (voterId) => {
      const voter = await this.voterService.getVoterById(voterId)
      const token = await this.voteService.generateToken(voter)

      const subject = 'Vote in the upcoming election'
      await this.emailService.sendMailWithTemplate(
        voter.email,
        subject,
        'neqvygm5zmw40p7w',
        {
          email: voter.email,
          data: {
            link: `${this.frontendUrl}/vote?token=${token}`,
            endDate: this.formatDateTime(election.endDate),
          },
        },
      )
    })
  }

  async sendBulkPreElectionEmails(election: ElectionWithoutVotes) {
    election.voterIds.forEach(async (voterId) => {
      const voter = await this.voterService.getVoterById(voterId)
      const token = await this.voteService.generateToken(voter)

      const subject = 'Vote in the upcoming election. Starts within an hour'
      await this.emailService.sendMailWithTemplate(
        voter.email,
        subject,
        '0r83ql3kzkv4zw1j',
        {
          email: voter.email,
          data: {
            link: `${this.frontendUrl}/vote?token=${token}`,
            startDate: this.formatDateTime(election.startDate),
            endDate: this.formatDateTime(election.endDate),
          },
        },
      )
    })
  }

  async sendBulkPostElectionEmails(election: ElectionWithoutVotes) {
    election.voterIds.forEach(async (voterId) => {
      const voter = await this.voterService.getVoterById(voterId)

      const subject = 'Election results are out. Check them out'
      await this.emailService.sendMailWithTemplate(
        voter.email,
        subject,
        '351ndgwo7654zqx8',
        {
          email: voter.email,
          data: {
            link: `${this.frontendUrl}/election/${getYear(election)}`,
            endDate: this.formatDateTime(election.endDate),
          },
        },
      )
    })
  }

  async sendPreOrPostElectionEmails() {
    const election = await this.electionService.getLatestElection()
    if (!election) throw new NotFoundException('No elections found')
    if (isActive(election))
      throw new NotFoundException('Election is still active')

    const now = new Date().getTime()
    const startTime = election.startDate.getTime()
    const endTime = election.endDate.getTime()
    if (startTime - 3600000 < now && now < startTime) {
      // Send pre-election emails
      await this.sendBulkPreElectionEmails(election)
      return { message: 'Pre-election emails sent' }
    } else if (now > endTime) {
      // Send post-election emails
      await this.sendBulkPostElectionEmails(election)
      return { message: 'Post-election emails sent' }
    } else {
      throw new Error('Not the right time to send emails')
    }
  }
}
