import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

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
    return reply.status(401).send({ code: 'UNAUTHORIZED' })
  }

  const currentUser: CurrentUser | null = app.jwt.decode(token)

  if (currentUser === null) {
    return reply.status(401).send({ code: 'UNAUTHORIZED' })
  }

  return { currentUser }
}
