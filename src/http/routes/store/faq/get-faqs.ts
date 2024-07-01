import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import { getLoggedUser } from '../../../middleware'
import { Unauthorized } from '../../_errors/unauthorized'

export async function getFaqs(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/store/faqs/:slug',
    {
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        // response: {
        //   200: z.array(z.object({})),
        // },
      },
    },
    async (request, reply) => {
      const { slug } = request.params

      const faqs = await prisma.storeFaqs.findMany({
        where: {
          store: {
            slug,
          },
        },
      })

      return reply.status(200).send(faqs)
    }
  )
  app.withTypeProvider<ZodTypeProvider>().get(
    '/store/faqs',
    {
      schema: {
        // response: {
        //   200: z.array(z.object({})),
        // },
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja.')
      }

      const faqs = await prisma.storeFaqs.findMany({
        where: {
          storeId,
        },
      })

      return reply.status(200).send(faqs)
    }
  )
}
