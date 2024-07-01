import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLOUDFLARE_ENDPOINT: z.string().url(),
  CLOUDFLARE_ACCESS_KEY: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  JWT_AND_COOKIES_SIGN_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  BASE_URL: z.string(),
})

export const env = envSchema.parse(process.env)
