import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { Unauthorized } from '../_errors/unauthorized'

export async function editProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/products/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().min(2),
          price: z.number(),
          description: z.string().nullable(),
          stock: z.number().positive(),
          can_sell_without_stock: z.boolean(),
        }),
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)
      const { name, price, description, stock, can_sell_without_stock } =
        request.body
      const { id } = request.params

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja')
      }

      await prisma.product.update({
        data: {
          name,
          price,
          description,
          stock,
          canSellWithoutStock: can_sell_without_stock,
        },
        where: {
          id,
        },
      })

      return reply.status(204).send()
    }
  )
}
