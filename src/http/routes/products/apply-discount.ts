import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { generateSlug } from '../../../utils/generate-slug'
import { Unauthorized } from '../_errors/unauthorized'

export async function applyDiscountOnProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/products/:id/discount',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          discount: z.number().min(0).max(100),
        }),
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)
      const { discount } = request.body
      const { id } = request.params

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja')
      }

      await prisma.product.update({
        data: {
          discount,
        },
        where: {
          id,
        },
      })

      return reply.status(204).send()
    }
  )
}
