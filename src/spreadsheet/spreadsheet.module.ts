import { Module } from '@nestjs/common'
import { SpreadsheetController } from './spreadsheet.controller'
import { SpreadsheetService } from './spreadsheet.service'
import { NestjsFormDataModule } from 'nestjs-form-data'

@Module({
  imports: [NestjsFormDataModule],
  controllers: [SpreadsheetController],
  providers: [SpreadsheetService],
})
export class SpreadsheetModule {}
