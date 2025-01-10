import { Module } from '@nestjs/common'
import { ForgotPasswordController } from './forgot-password.controller'
import { ForgotPasswordService } from './forgot-password.service'
import { JWTResetStrategy } from './jwt-reset.strategy'
import { EmailModule } from 'src/email/email.module'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from 'src/users/users.module'

@Module({
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService, JWTResetStrategy],
  imports: [
    UsersModule,
    EmailModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        senderDomain: process.env.SENDER_DOMAIN!,
        senderName: 'FUTA Election',
        apiKey: config.getOrThrow<string>('MAILERSEND_API_KEY'),
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '10m' },
      }),
    }),
  ],
})
export class ForgotPasswordModule {}
