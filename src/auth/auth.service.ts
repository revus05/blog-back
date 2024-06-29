import { Injectable } from '@nestjs/common'
import prisma from '../../prisma/client/prismaClient'
import { Users } from '@prisma/client'

@Injectable()
export class AuthService {
  async getUser(): Promise<Users[]> {
    return prisma.users.findMany({})
  }
}
