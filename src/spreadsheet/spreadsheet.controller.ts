import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { SpreadsheetService } from './spreadsheet.service'
import { SpreadsheetDTO } from './spreadsheet.dto'
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { FormDataRequest } from 'nestjs-form-data'

@Controller('spreadsheet')
export class SpreadsheetController {
  constructor(private readonly spreadsheetService: SpreadsheetService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SpreadsheetDTO })
  @ApiOperation({
    summary: 'Upload a spreadsheet file',
    description:
      'The file is processed and the data is returned in JSON format.',
  })
  @ApiResponse({
    status: 200,
    description:
      'The file has been successfully uploaded and processed. Returns a JSON object with values as arrays of objects.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: {
            sheet1: [
              { column1: 'value1', column2: 'value2' },
              { column1: 'value3', column2: 'value4' },
            ],
            sheet2: [
              { column1: 'value1', column2: 'value2' },
              { column1: 'value3', column2: 'value4' },
            ],
          },

          additionalProperties: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File is not a valid spreadsheet.' })
  @FormDataRequest()
  @HttpCode(200)
  uploadSpreadsheet(@Body() spreadsheetDto: SpreadsheetDTO) {
    return this.spreadsheetService.processWorkbook(spreadsheetDto.file)
  }
}
