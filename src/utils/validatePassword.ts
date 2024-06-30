import validator from './validator'

const validatePassword = (password: unknown) => {
  return validator<'password'>(password, {
    type: 'string',
    name: 'password',
    maxLength: 64,
    notEmpty: true,
  })
}

export default validatePassword
