import { FastifyInstance } from 'fastify'
import { BadRequest } from './routes/_errors/bad-request'
import { ZodError } from 'zod'
import { Unauthorized } from './routes/_errors/unauthorized'
import { Conflict } from './routes/_errors/conflict'
import { Forbidden } from './routes/_errors/forbidden'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Error during validation.',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequest) {
    return reply.status(400).send({ message: error.message })
  }

  if (error instanceof Unauthorized) {
    return reply
      .status(401)
      .send({ message: error.message ? error.message : 'Unauthorized' })
  }

  if (error instanceof Forbidden) {
    return reply
      .status(403)
      .send({ message: error.message ? error.message : 'Forbidden' })
  }

  if (error instanceof Conflict) {
    return reply.status(409).send({ message: error.message })
  }

  console.log('Fatal Error: \n' + error)
  return reply.status(500).send({ message: 'Internal Server Error!', error })
}
