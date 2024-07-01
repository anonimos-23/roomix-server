import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'

export async function deleteProductFromCart(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/cart/item/:productId',
    {
      schema: {
        params: z.object({
          productId: z.string().uuid(),
        }),
        response: {
          201: z.null(),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = await getLoggedUser(app, request)
      const { productId } = request.params

      await prisma.shoppingCart.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })

      return reply.status(200).send()
    }
  )
}
