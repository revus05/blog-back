import { Module } from '@nestjs/common'
import { LoginModule } from './auth/login/login.module'
import { RegisterModule } from './auth/register/register.module'

@Module({
  imports: [LoginModule, RegisterModule],
})
export class AppModule {}
