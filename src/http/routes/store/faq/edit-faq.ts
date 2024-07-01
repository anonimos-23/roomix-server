import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../../../lib/prisma'
import { getLoggedUser } from '../../../middleware'
import { Unauthorized } from '../../_errors/unauthorized'
import { z } from 'zod'

export async function editFaq(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/store/faq/:faqId',
    {
      schema: {
        params: z.object({
          faqId: z.coerce.number(),
        }),
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
      const { faqId } = request.params
      const { answer, question } = request.body

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja.')
      }

      await prisma.storeFaqs.update({
        where: {
          id: faqId,
          storeId,
        },
        data: {
          question,
          answer,
        },
      })

      return reply.status(200).send()
    }
  )
}
