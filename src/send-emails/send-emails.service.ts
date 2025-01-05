import { Injectable, NotFoundException } from '@nestjs/common'
import { ElectionService } from 'src/election/election.service'
import { ElectionWithoutVotes } from 'src/election/hideVotes'
import { EmailService } from 'src/email/email.service'
import { isActive } from 'src/schemas/election.schema'
import { VoteService } from 'src/vote/vote.service'
import { VoterService } from 'src/voter/voter.service'

@Injectable()
export class SendEmailsService {
  constructor(
    private readonly electionService: ElectionService,
    private readonly voteService: VoteService,
    private readonly emailService: EmailService,
    private readonly voterService: VoterService,
  ) {}

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
        '0r83ql3kzkv4zw1j',
        {
          email: voter.email,
          data: {
            link: `http://localhost:3000/vote?token=${token}`,
            endDate: election.endDate.toDateString(),
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
            link: `http://localhost:3000/vote?token=${token}`,
            startDate: election.startDate.toDateString(),
          },
        },
      )
    })
  }

  async sendBulkPostElectionEmails(election: ElectionWithoutVotes) {
    election.voterIds.forEach(async (voterId) => {
      const voter = await this.voterService.getVoterById(voterId)
      const token = await this.voteService.generateToken(voter)

      const subject = 'Election results are out. Check them out'
      await this.emailService.sendMailWithTemplate(
        voter.email,
        subject,
        '0r83ql3kzkv4zw1j',
        {
          email: voter.email,
          data: {
            link: `http://localhost:3000/vote?token=${token}`,
            endDate: election.endDate.toDateString(),
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

    const now = new Date()
    const timeDiff = election.startDate.getTime() - now.getTime()
    if (timeDiff < 0 || timeDiff > 3600 * 1000) {
      // Send pre-election emails
      await this.sendBulkPreElectionEmails(election)
    } else {
      // Send post-election emails
      await this.sendBulkPostElectionEmails(election)
    }
  }
}
