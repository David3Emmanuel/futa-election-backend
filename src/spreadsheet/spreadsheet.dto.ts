import { IsFile, MemoryStoredFile } from 'nestjs-form-data'

export class SpreadsheetDTO {
  @IsFile()
  file: MemoryStoredFile
}
