import { Body, Controller, Post, Res } from '@nestjs/common'
import { LoginService } from './login.service'
import { LoginRaw } from '../../types/login/login'
import { Response } from 'express'

@Controller('login')
export class LoginController {
  constructor(private readonly appService: LoginService) {}

  @Post('credentials')
  async getUser(@Body() queryBody: LoginRaw, @Res({ passthrough: true }) res: Response) {
    const response = await this.appService.loginWithCredentials(queryBody)
    if (response.status === 'error') {
      return response
    }
    if (response.data?.jwt) {
      res.cookie('jwt', response.data.jwt)
      delete response.data.jwt
    }
    return response
  }
}
