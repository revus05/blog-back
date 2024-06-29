import { Body, Controller, Post } from '@nestjs/common'
import { RegiserService } from './regiser.service'

@Controller('register')
export class RegisterController {
  constructor(private readonly appService: RegiserService) {}

  @Post('')
  async registerUser(@Body() queryBody) {}
}
