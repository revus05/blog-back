type Options<Name> = {
  name: Name
  type: 'string'
  notEmpty?: boolean
  minLength?: number
  maxLength?: number
  regExp?: RegExp
}

export type ValidatorErrors<Name extends string> =
  | `Wrong ${Name} type`
  | `Empty ${Name}`
  | `Maximum ${Name} length is ${number} characters`
  | `Minimum ${Name} length is ${number} characters`
  | `Wrong ${Name} format`
  | `No ${Name} provided`

const validator = <Name extends string>(value: unknown, options: Options<Name>): ValidatorErrors<Name> | null => {
  if (typeof value === 'undefined') {
    return `No ${options.name} provided`
  }
  if (typeof value !== options.type) {
    return `Wrong ${options.name} type`
  }
  if (options.notEmpty && !value) {
    return `Empty ${options.name}`
  }
  if (options.maxLength && String(value).length > options.maxLength) {
    return `Maximum ${options.name} length is ${options.maxLength} characters`
  }
  if (options.minLength && String(value).length < options.minLength) {
    return `Minimum ${options.name} length is ${options.minLength} characters`
  }
  if (options.regExp && !options.regExp.test(String(value))) {
    return `Wrong ${options.name} format`
  }
  return null
}

export default validator
