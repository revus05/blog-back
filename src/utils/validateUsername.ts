import validator from './validator'

const validateUsername = (username: unknown) => {
  return validator<'username'>(username, {
    type: 'string',
    name: 'username',
    maxLength: 64,
    notEmpty: true,
  })
}

export default validateUsername
