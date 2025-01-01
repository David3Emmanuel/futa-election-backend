import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ElectionModule } from './election/election.module'
import { CandidateModule } from './candidate/candidate.module'
import { VoterModule } from './voter/voter.module'
import { VoteModule } from './vote/vote.module'
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SpreadsheetModule } from './spreadsheet/spreadsheet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        dbName: 'futa_election',
      }),
    }),
    ElectionModule,
    CandidateModule,
    VoterModule,
    VoteModule,
    CloudinaryModule,
    SpreadsheetModule,
  ],
})
export class AppModule {}
