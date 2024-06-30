import { Injectable } from '@nestjs/common'
import { RegisterData, RegisterRaw } from '../../types/register/register'
import prisma from '../../../prisma/client/prismaClient'
import { ErrorResponse, Response, SuccessResponse } from '../../types/Response'
import getSuccessMessage from '../../utils/getSuccessMessage'
import getErrorMessage from '../../utils/getErrorMessage'
import { ValidatorErrors } from '../../utils/validator'
import { Prisma, User } from '@prisma/client'
import validateEmail from '../../utils/validateEmail'
import validatePassword from '../../utils/validatePassword'
import validateUsername from '../../utils/validateUsername'

type Fields = 'email' | 'password' | 'username'
type UniqueFields = 'email' | 'username'

type Errors = ValidatorErrors<Fields>

type RegisterUser =
  | ErrorResponse<Errors[] | `Unhandled error happened` | `User with this ${UniqueFields} already existing`>
  | SuccessResponse<'User registered successfully', User>

@Injectable()
export class RegisterService {
  async registerUser(queryBody: RegisterRaw): Promise<RegisterUser> {
    const registerData = this.validateRegisterQueryBody(queryBody)

    if (registerData.status === 'error') {
      return registerData
    }

    return await this.createUser(registerData.data)
  }

  private async createUser(data: RegisterData): Promise<RegisterUser> {
    try {
      const newUser: User = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash: data.password,
        },
      })
      if (newUser) {
        return getSuccessMessage<'User registered successfully', User>('User registered successfully', newUser)
      }
    } catch (error) {
      return this.handleUniqueConstraintError(error)
    }
    return getErrorMessage('Unhandled error happened')
  }

  private handleUniqueConstraintError(error: unknown): RegisterUser {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const failedField = String(error.meta.target).includes('email') ? 'email' : 'username'
        return getErrorMessage<`User with this ${UniqueFields} already existing`>(
          `User with this ${failedField} already existing`,
        )
      }
    }
    return getErrorMessage('Unhandled error happened')
  }

  private validateRegisterQueryBody(
    queryBody: RegisterRaw,
  ): Response<'Register data is valid', Errors[], RegisterData> {
    const result: Partial<RegisterData> = {}
    const errors: Errors[] = []

    const emailValidationError = validateEmail(queryBody.email)
    if (emailValidationError) {
      errors.push(emailValidationError)
    } else {
      result.email = queryBody.email as string
    }
    const usernameValidationError = validateUsername(queryBody.username)
    if (usernameValidationError) {
      errors.push(usernameValidationError)
    } else {
      result.username = queryBody.username as string
    }
    const passwordValidationError = validatePassword(queryBody.password)
    if (passwordValidationError) {
      errors.push(passwordValidationError)
    } else {
      result.password = queryBody.password as string
    }

    if (errors.length) {
      return getErrorMessage<Errors[]>(errors)
    }
    return getSuccessMessage<'Register data is valid', RegisterData>('Register data is valid', result as RegisterData)
  }
}
