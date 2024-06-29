import { Injectable } from '@nestjs/common'
import { RegisterData, RegisterRaw } from '../../types/register/register'
import prisma from '../../../prisma/client/prismaClient'
import { ErrorResponse, Response, SuccessResponse } from '../../types/Response'
import getSuccessMessage from '../../utils/getSuccessMessage'
import getErrorMessage from '../../utils/getErrorMessage'
import validator, { ValidatorErrors } from '../../utils/validator'
import { Prisma, User } from '@prisma/client'

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

    this.validateEmail(queryBody.email, result, errors)
    this.validateUsername(queryBody.username, result, errors)
    this.validatePassword(queryBody.password, result, errors)

    if (errors.length) {
      return getErrorMessage<Errors[]>(errors)
    }
    return getSuccessMessage<'Register data is valid', RegisterData>('Register data is valid', result as RegisterData)
  }

  private validateEmail(email: unknown, result: Partial<RegisterData>, errors: Errors[]): void {
    const emailError = validator<'email'>(email, {
      type: 'string',
      name: 'email',
      regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      maxLength: 64,
      notEmpty: true,
    })
    if (emailError) {
      errors.push(emailError)
    } else {
      result.email = email as string
    }
  }

  private validateUsername(username: unknown, result: Partial<RegisterData>, errors: Errors[]): void {
    const usernameError = validator<'username'>(username, {
      type: 'string',
      name: 'username',
      maxLength: 64,
      notEmpty: true,
    })
    if (usernameError) {
      errors.push(usernameError)
    } else {
      result.username = username as string
    }
  }

  private validatePassword(password: unknown, result: Partial<RegisterData>, errors: Errors[]): void {
    const passwordError = validator<'password'>(password, {
      type: 'string',
      name: 'password',
      maxLength: 64,
      notEmpty: true,
    })
    if (passwordError) {
      errors.push(passwordError)
    } else {
      result.password = password as string
    }
  }
}
