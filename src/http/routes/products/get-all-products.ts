import { FastifyInstance } from 'fastify'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

interface TProduct {
  id: string
  name: string
  description: string | null
  price: number
  discount: number
  stock: number
  can_sell_without_stock: boolean
  slug: string
  created_at: string
  images: string[]
}

export async function getAllProducts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/products/all', async (_request, reply) => {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          stock: true,
          price: true,
          slug: true,
          discount: true,
          canSellWithoutStock: true,
          createdAt: true,
          Product_Image: {
            select: {
              fileId: true,
            },
          },
        },
      })

      return reply.status(200).send(
        products.map((product) => {
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            stock: product.stock,
            can_sell_without_stock: product.canSellWithoutStock,
            slug: product.slug,
            created_at: product.createdAt,
            images: product.Product_Image.map((image) => {
              return image.fileId
            }),
          }
        })
      )
    })
}
