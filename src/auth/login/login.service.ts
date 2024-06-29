import { Injectable } from '@nestjs/common'
import prisma from '../../../prisma/client/prismaClient'
import { Users } from '@prisma/client'

@Injectable()
export class LoginService {
  async getUser(): Promise<Users[]> {
    return prisma.users.findMany({})
  }
}
