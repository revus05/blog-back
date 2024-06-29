import { Body, Controller, Post } from '@nestjs/common'
import { RegisterService } from './register.service'
import { RegisterRaw } from '../../types/register/register'

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('')
  async registerUser(@Body() queryBody: RegisterRaw) {
    return await this.registerService.registerUser(queryBody)
  }
}
