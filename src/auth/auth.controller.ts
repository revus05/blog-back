import { Controller, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Users } from '@prisma/client'

@Controller('login')
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Get('')
  async getUser(): Promise<Users[]> {
    return this.appService.getUser()
  }
}
