import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { Unauthorized } from '../_errors/unauthorized'

export async function deleteProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/products/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { storeId } = await getLoggedUser(app, request)

      if (storeId === null) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja.')
      }

      await prisma.product.delete({
        where: {
          id,
        },
      })

      return reply.status(200).send()
    }
  )
}
