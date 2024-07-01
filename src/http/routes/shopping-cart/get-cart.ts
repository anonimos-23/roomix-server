import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'

interface Product {
  productId: string
  name: string
  price: number
  discount: number
  quantity: number
  images: string[]
}

interface StoreWithProducts {
  store: {
    id: string
    name: string
  }
  items: Product[]
}

export async function getCart(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/cart',
    {
      schema: {
        // response: {
        //   200: z.array(
        //     z.object({
        //       productId: z.string().uuid(),
        //       quantity: z.number(),
        //       created_at: z.date(),
        //     })
        //   ),
        //   401: z.object({
        //     message: z.string(),
        //   }),
        // },
      },
    },
    async (request, reply) => {
      const { userId } = await getLoggedUser(app, request)

      const cart = await prisma.shoppingCart.findMany({
        where: {
          userId,
        },
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              Product_Image: {
                select: {
                  fileId: true,
                },
              },
              discount: true,
              store: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (cart === null) {
        return reply.status(204).send()
      }

      const data = cart.reduce<StoreWithProducts[]>((acc, item) => {
        const storeId = item.product.store.id
        const storeName = item.product.store.name
        const product: Product = {
          productId: item.product.id,
          quantity: item.quantity,
          name: item.product.name,
          price: item.product.price.toNumber(),
          images: item.product.Product_Image.map((file) => {
            return file.fileId
          }),
          discount: item.product.discount,
        }

        // Find the store in the accumulator
        let store = acc.find((s) => s.store.id === storeId)

        // If the store doesn't exist, create a new entry for it
        if (!store) {
          store = {
            store: {
              id: storeId,
              name: storeName,
            },
            items: [],
          }
          acc.push(store)
        }

        // Add the product to the store's items
        store.items.push(product)

        return acc
      }, [])

      return reply.status(200).send(
        data.map((group) => {
          return {
            store: {
              id: group.store.id,
              name: group.store.name,
            },
            items: group.items.map(
              ({ productId, name, price, discount, images, quantity }) => {
                return {
                  productId,
                  name,
                  price,
                  discount,
                  quantity,
                  images,
                }
              }
            ),
          }
        })
      )
    }
  )
}
