import { Module } from '@nestjs/common'
import { RegisterController } from './register.controller'
import { RegiserService } from './regiser.service'

@Module({
  controllers: [RegisterController],
  providers: [RegiserService],
})
export class RegisterModule {}
