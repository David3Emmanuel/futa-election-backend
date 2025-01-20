import { Controller, Get } from '@nestjs/common'

@Controller()
export class HealthCheckController {
  @Get()
  getMessage() {
    return 'FUTA AEC API is live'
  }
}
