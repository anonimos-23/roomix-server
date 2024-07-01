import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import bcrypt from 'bcrypt'

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/reset-password',
    {
      schema: {
        querystring: z.object({
          code: z.string(),
        }),
        body: z.object({
          newPassword: z.string().min(8),
        }),
        // response: {
        //   200: z.object({}),
        //   204: z.null(),
        // },
      },
    },
    async (request, reply) => {
      const { newPassword } = request.body
      const { code } = request.query

      const dbToken = await prisma.token.findFirst({
        where: {
          type: 'RESET_PASSWORD',
          value: code,
        },
      })

      if (!dbToken) {
        return reply.status(404).send()
      }

      const { userId } = app.jwt.verify<{ userId: string }>(dbToken.value)

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPassword,
        },
      })

      await prisma.token.deleteMany({
        where: {
          userId,
          type: 'RESET_PASSWORD',
        },
      })

      return reply.status(201).send()
    }
  )
}
