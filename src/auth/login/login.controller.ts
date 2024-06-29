import { Controller, Get } from '@nestjs/common'
import { LoginService } from './login.service'
import { Users } from '@prisma/client'

@Controller('login')
export class LoginController {
  constructor(private readonly appService: LoginService) {}

  @Get('')
  async getUser(): Promise<Users[]> {
    return this.appService.getUser()
  }
}
