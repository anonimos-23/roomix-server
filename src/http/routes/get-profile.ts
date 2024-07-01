import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getLoggedUser } from '../middleware'
import { Forbidden } from './_errors/forbidden'

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/me',
    {
      schema: {
        response: {
          200: z.object({
            email: z.string(),
            name: z.string(),
            phone: z.string().nullable(),
            fileId: z.string().nullable(),
            storeId: z.string().nullable(),
          }),
          401: z.object({
            message: z.string(),
          }),
          403: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = await getLoggedUser(app, request)

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          gender: true,
          phone: true,
          fileId: true,
          store: {
            select: {
              id: true,
            },
          },
        },
      })

      if (user === null) {
        throw new Forbidden('Something went wrong getting profile data')
      }

      return reply.status(200).send({
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        phone: user.phone,
        fileId: user.fileId,
        storeId: user.store !== null ? user.store.id : null,
      })
    }
  )
}
