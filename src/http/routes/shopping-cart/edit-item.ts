import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'

export async function editProductFromCart(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/cart/item',
    {
      schema: {
        body: z.object({
          productId: z.string().uuid(),
          quantity: z.number().positive(),
        }),
        response: {
          200: z.null(),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = await getLoggedUser(app, request)
      const { productId, quantity } = request.body

      await prisma.shoppingCart.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          quantity,
        },
      })

      return reply.status(200).send()
    }
  )
}
