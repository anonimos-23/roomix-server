import { FastifyInstance, FastifyRequest } from 'fastify'
import { Unauthorized } from './routes/_errors/unauthorized'
import { z } from 'zod'
import { VerifyPayloadType } from '@fastify/jwt'

const jwtPayloadSchema = z.object({
  userId: z.string(),
  storeId: z.string().nullable(),
})

type AccessTokenPayload = VerifyPayloadType & z.infer<typeof jwtPayloadSchema>

export async function getLoggedUser(
  { jwt }: FastifyInstance,
  request: FastifyRequest
) {
  const accessToken = request.headers.authorization?.split(' ')[1]

  if (accessToken === undefined) {
    throw new Unauthorized()
  }

  const payload = jwt.verify<AccessTokenPayload>(accessToken)

  if (payload === null) {
    throw new Unauthorized()
  }

  return payload
}
