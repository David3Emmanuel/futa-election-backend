import { Controller, Get } from '@nestjs/common'

@Controller()
export class TestController {
  @Get()
  getMessage() {
    return 'FUTA AEC API is live'
  }
}
