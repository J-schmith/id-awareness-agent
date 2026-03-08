function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function optionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue
}

export const config = {
  // Required
  ANTHROPIC_API_KEY: requireEnv('ANTHROPIC_API_KEY'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  NEXTAUTH_SECRET: requireEnv('NEXTAUTH_SECRET'),

  // Optional
  AWS_ACCESS_KEY_ID: optionalEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: optionalEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: optionalEnv('AWS_REGION', 'eu-west-1'),
  SES_FROM_EMAIL: optionalEnv('SES_FROM_EMAIL'),
  NEXTAUTH_URL: optionalEnv('NEXTAUTH_URL'),
} as const
