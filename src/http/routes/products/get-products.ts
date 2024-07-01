import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { Unauthorized } from '../_errors/unauthorized'
import { z } from 'zod'

export async function getProducts(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/products',
    {
      schema: {
        // response: {
        //   200: z.array(z.object({})),
        // },
      },
    },
    async (request, reply) => {
      const { storeId } = await getLoggedUser(app, request)

      if (storeId === null) {
        throw new Unauthorized('Operação exclusiva para gerentes de uma loja.')
      }

      const products = await prisma.product.findMany({
        where: {
          storeId,
        },
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
    }
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/store/:slug/products',
    {
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        // response: {
        //   200: z.array(z.object({})),
        // },
      },
    },
    async (request, reply) => {
      const { slug } = request.params

      const products = await prisma.product.findMany({
        where: {
          store: {
            slug,
          },
        },
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
    }
  )
}
