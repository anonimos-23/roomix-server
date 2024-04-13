import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcrypt'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function auth(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return reply
          .status(401)
          .send({ message: 'Email ou password inválidos.' })
      }

      const doesPasswordMatch = await bcrypt.compare(password, user.password)

      if (!doesPasswordMatch) {
        return reply
          .status(401)
          .send({ message: 'Email ou password inválidos.' })
      }

      let name = user.lastName
        ? user.firstName.concat(user.lastName)
        : user.firstName

      const token = app.jwt.sign(
        {
          name,
          avatarUrl: user.avatar,
        },
        {
          sub: user.id,
          expiresIn: '12 hours',
        }
      )

      reply.setCookie('auth', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 12,
      })

      return reply.status(200).send({ token })
    }
  )
}
