import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function getProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/product/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        // response: {
        //   200: z.object({}),
        //   204: z.null(),
        // },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const product = await prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          canSellWithoutStock: true,
          slug: true,
          discount: true,
          storeId: true,
          Product_Image: {
            select: {
              fileId: true,
            },
          },
        },
      })

      if (product === null) {
        return reply.status(204).send()
      }

      return reply.status(200).send({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        can_sell_without_stock: product.canSellWithoutStock,
        slug: product.slug,
        discount: product.discount,
        images: product.Product_Image.map((file) => {
          return file.fileId
        }),
        storeId: product.storeId,
      })
    }
  )
}
