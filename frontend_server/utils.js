export function assertEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value ? '[set]' : '[not set]'}`)
  if (value === 'NULL') return ''
  if (!value) {
    throw new Error(
      `Invalid environment variable. Name: ${name}, value: ${value}`,
    )
  }
  return value
}

export function getBooleanEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value ? '[set]' : '[not set]'}`)
  if (value && value !== 'true' && value !== 'false') {
    throw new Error(
      `Invalid boolean environment variable. Name: ${name}, value: ${value}`,
    )
  }
  return value === 'true'
}