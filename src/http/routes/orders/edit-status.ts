import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { Unauthorized } from '../_errors/unauthorized'

export async function editOrderStatus(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/order/:id/status',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          status: z.enum(['Canceled', 'Preparing', 'Delivering', 'Delivered']),
        }),
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)
      const { status } = request.body
      const { id } = request.params

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja')
      }

      await prisma.order.update({
        data: {
          status,
        },
        where: {
          id,
          storeId,
        },
      })

      return reply.status(200).send()
    }
  )
}
