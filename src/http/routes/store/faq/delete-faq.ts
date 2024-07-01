import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../../../lib/prisma'
import { getLoggedUser } from '../../../middleware'
import { Unauthorized } from '../../_errors/unauthorized'
import { z } from 'zod'

export async function deleteFaq(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/store/faq/:faqId',
    {
      schema: {
        params: z.object({
          faqId: z.coerce.number(),
        }),
        // response: {
        //   200: z.array(z.object({})),
        // },
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)
      const { faqId } = request.params

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja.')
      }

      await prisma.storeFaqs.delete({
        where: {
          id: faqId,
          storeId,
        },
      })

      return reply.status(200).send()
    }
  )
}
