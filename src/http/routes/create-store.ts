import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { getLoggedUser } from '../middleware'
import { Conflict } from './_errors/conflict'

export async function createStore(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/store',
    {
      schema: {
        body: z.object({
          name: z.string().min(2),
          country: z.string(),
          slogan: z.string().nullable(),
          email: z.string().email(),
        }),
        // response: {
        //   201: z.object({
        //     storeId: z.string(),
        //   }),
        //   400: z.object({
        //     message: z.string(),
        //   }),
        //   409: z.object({
        //     message: z.string(),
        //   }),
        // },
      },
    },
    async (request, reply) => {
      const { customAlphabet } = await import('nanoid')
      const nanoid = customAlphabet('1234567890')
      const { userId } = await getLoggedUser(app, request)
      const { name, country, email, slogan } = request.body

      const userAlreadyHaveStore = await prisma.store.findUnique({
        where: {
          userId,
        },
      })

      if (userAlreadyHaveStore !== null) {
        throw new Conflict('Só pode criar uma loja por conta!')
      }

      const slug = nanoid(10)

      const { id } = await prisma.store.create({
        data: {
          name,
          country,
          slug,
          email,
          slogan,
          userId,
        },
      })

      return reply.status(201).send({ storeId: id })
    }
  )

  app.get('/stores/all', async () => {
    const stores = await prisma.store.findMany()

    return stores
  })

  app.delete('/store', async () => {
    const result = await prisma.store.delete({
      where: {
        id: '7d885018-39dc-4278-a1fc-f9753454c3e1',
      },
    })

    return result
  })
}
