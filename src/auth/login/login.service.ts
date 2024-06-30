import { Injectable } from '@nestjs/common'
import { LoginData, LoginRaw } from '../../types/login/login'
import { ErrorResponse, Response, SuccessResponse } from '../../types/Response'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ValidatorErrors } from '../../utils/validator'
import prisma from '../../../prisma/client/prismaClient'
import { User } from '@prisma/client'
import validateEmail from '../../utils/validateEmail'
import validatePassword from '../../utils/validatePassword'
import * as bcrypt from 'bcryptjs'
import * as JWT from 'jsonwebtoken'

type Fields = 'email' | 'password'

type Errors = ValidatorErrors<Fields>

type LoginUser =
  | SuccessResponse<'User logged in successfully', { user: Omit<User, 'passwordHash'>; jwt: JWT }>
  | ErrorResponse<'No user with your credentials found' | 'Unhandled error happened'>

@Injectable()
export class LoginService {
  async loginWithCredentials(credentials: LoginRaw): Promise<LoginUser | ErrorResponse<Errors[]>> {
    const validateResponse = this.validateLoginCredentials(credentials)

    if (validateResponse.status === 'error') {
      return validateResponse
    }

    return await this.loginUser(validateResponse.data)
  }

  private async loginUser(credentials: LoginData): Promise<LoginUser> {
    try {
      const user: User = await prisma.user.findUnique({
        where: {
          email: credentials.email,
        },
      })

      if (user) {
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.passwordHash)
        if (isPasswordMatch) {
          delete user.passwordHash
          return getSuccessMessage<'User logged in successfully', { user: Omit<User, 'passwordHash'>; jwt: JWT }>(
            'User logged in successfully',
            { user, jwt: JWT.sign({ id: user.id }, process.env.SECRET, { expiresIn: '30d' }) },
          )
        }
      }

      return getErrorMessage<'No user with your credentials found'>('No user with your credentials found')
    } catch (e) {
      console.log(e)
      return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
    }
  }

  private validateLoginCredentials(credentials: LoginRaw): Response<'Login data is valid', Errors[], LoginData> {
    const result: Partial<LoginData> = {}
    const errors: Errors[] = []

    const emailValidationError = validateEmail(credentials.email)
    if (emailValidationError) {
      errors.push(emailValidationError)
    } else {
      result.email = credentials.email as string
    }
    const passwordValidationError = validatePassword(credentials.password)
    if (passwordValidationError) {
      errors.push(passwordValidationError)
    } else {
      result.password = credentials.password as string
    }

    if (errors.length) {
      return getErrorMessage<Errors[]>(errors)
    }
    return getSuccessMessage<'Login data is valid', LoginData>('Login data is valid', result as LoginData)
  }
}
