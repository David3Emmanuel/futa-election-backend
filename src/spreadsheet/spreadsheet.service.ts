import { BadRequestException, Injectable } from '@nestjs/common'
import { MemoryStoredFile } from 'nestjs-form-data'
import * as xlsx from 'xlsx'

@Injectable()
export class SpreadsheetService {
  processWorkbook(file: MemoryStoredFile) {
    let workbook
    try {
      workbook = xlsx.read(file.buffer, { type: 'buffer' })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new BadRequestException('File is not a valid spreadsheet')
    }

    const result: Record<string, unknown[]> = {}
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      result[camelCase(sheetName)] = this.processSpreadsheet(sheet)
    }
    return result
  }

  processSpreadsheet(sheet: xlsx.WorkSheet) {
    convertHeaderToCamelCase(sheet)
    const data = xlsx.utils.sheet_to_json(sheet)
    return data
  }
}

function convertHeaderToCamelCase(sheet: xlsx.WorkSheet) {
  for (const key in sheet) {
    if (key.endsWith('1')) {
      const value = sheet[key].v
      const newValue = camelCase(value)

      for (const key2 in sheet[key]) {
        sheet[key][key2] = sheet[key][key2].replace(value, newValue)
      }
    }
  }
}

function camelCase(str: string) {
  let out = str.replace(/[^a-zA-Z0-9\s]/g, '')
  out = out.replace(/\s+/g, '_')
  out = out.replace(/_./g, (match) => match.charAt(1).toUpperCase())
  out = out.charAt(0).toLowerCase() + out.slice(1)

  return out
}
