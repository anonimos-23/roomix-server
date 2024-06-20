import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcrypt'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { Conflict } from './_errors/conflict'

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
          firstName: z.string().min(1),
          lastName: z.string().optional(),
        }),
        response: {
          201: z.null(),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password, firstName, lastName } = request.body

      const doesUserExists = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (doesUserExists) {
        throw new Conflict('Já existe uma conta associada a este e-mail.')
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      })

      return reply.status(201).send()
    }
  )
}
