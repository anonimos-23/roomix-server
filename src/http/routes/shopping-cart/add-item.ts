import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'

export async function addProductToCart(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/cart/item',
    {
      schema: {
        body: z.object({
          productId: z.string().uuid(),
          quantity: z.number(),
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
      const { productId, quantity } = request.body

      await prisma.shoppingCart.create({
        data: {
          userId,
          productId,
          quantity,
        },
      })

      return reply.status(201).send()
    }
  )
}
