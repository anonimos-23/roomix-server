import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../../../lib/prisma'
import { getLoggedUser } from '../../../middleware'
import { Unauthorized } from '../../_errors/unauthorized'
import { z } from 'zod'
import { Conflict } from '../../_errors/conflict'

export async function createFaq(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/store/faq',
    {
      schema: {
        body: z.object({
          question: z.string().min(2),
          answer: z.string().min(2),
        }),
        // response: {
        //   200: z.array(z.object({})),
        // },
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)
      const { answer, question } = request.body

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja.')
      }

      const faqs = await prisma.storeFaqs.findMany({
        where: {
          storeId,
        },
      })

      if (faqs.length > 5) {
        throw new Conflict('Já existem 5 questões relacionadas com esta loja.')
      }

      await prisma.storeFaqs.create({
        data: {
          question,
          answer,
          storeId,
        },
      })

      return reply.status(201).send()
    }
  )
}
