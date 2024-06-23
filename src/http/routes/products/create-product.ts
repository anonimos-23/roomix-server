import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { generateSlug } from '../../../utils/generate-slug'
import { Unauthorized } from '../_errors/unauthorized'

export async function createProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/products',
    {
      schema: {
        body: z.object({
          name: z.string().min(2),
          price: z.number(),
          description: z.string().nullable(),
        }),
        // response: {
        // },
      },
    },
    async (request, reply) => {
      const { customAlphabet } = await import('nanoid')
      const nanoid = customAlphabet('1234567890')
      const { storeId } = await getLoggedUser(app, request)
      const { name, price, description } = request.body

      if (!storeId) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja')
      }

      let slug = generateSlug(name)

      const isProductSlugAvailable = await prisma.product.findUnique({
        where: {
          slug,
        },
      })

      if (!isProductSlugAvailable) {
        slug = nanoid(5)
      }

      const { id } = await prisma.product.create({
        data: {
          name,
          price,
          description,
          slug,
          stock: 0,
          storeId,
        },
      })

      return reply.status(201).send({ productId: id })
    }
  )
}
