import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Unauthorized } from './routes/_errors/unauthorized'

interface CurrentUser {
  sub: string
  name: string
  avatarUrl: string
}

export async function getCurrentUser(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies.auth

  if (token === undefined) {
    throw new Unauthorized()
  }

  const currentUser: CurrentUser | null = app.jwt.decode(token)

  if (currentUser === null) {
    throw new Unauthorized()
  }

  return { currentUser }
}
