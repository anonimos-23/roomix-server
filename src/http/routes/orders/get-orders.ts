import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { Unauthorized } from '../_errors/unauthorized'
import { z } from 'zod'

export async function getOrders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/orders',
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

      const orders = await prisma.order.findMany({
        where: {
          storeId,
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          customerNotes: true,
          status: true,
          totalAmount: true,
          country: true,
          city: true,
          province: true,
          postal: true,
          address: true,
          currency: true,
          OrderItems: {
            select: {
              productId: true,
              quantity: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      return reply.status(200).send(
        orders.map((order) => {
          return {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerNotes: order.customerNotes,
            country: order.country,
            city: order.city,
            province: order.province,
            postal: order.postal,
            address: order.address,
            currency: order.currency,
            products: order.OrderItems.map((item) => {
              return {
                productId: item.productId,
                name: item.product.name,
                quantity: item.quantity,
              }
            }),
          }
        })
      )
    }
  )

  //   app.withTypeProvider<ZodTypeProvider>().get(
  //     '/me/orders',
  //     {
  //       schema: {
  //         // response: {
  //         //   200: z.array(z.object({})),
  //         // },
  //       },
  //     },
  //     async (request, reply) => {
  //       const { slug } = request.params

  //       const products = await prisma.product.findMany({
  //         where: {
  //           store: {
  //             slug,
  //           },
  //         },
  //         select: {
  //           id: true,
  //           name: true,
  //           description: true,
  //           stock: true,
  //           price: true,
  //           slug: true,
  //           discount: true,
  //           canSellWithoutStock: true,
  //           createdAt: true,
  //           Product_Image: {
  //             select: {
  //               fileId: true,
  //             },
  //           },
  //         },
  //       })

  //       return reply.status(200).send(
  //         products.map((product) => {
  //           return {
  //             id: product.id,
  //             name: product.name,
  //             description: product.description,
  //             price: product.price,
  //             discount: product.discount,
  //             stock: product.stock,
  //             can_sell_without_stock: product.canSellWithoutStock,
  //             slug: product.slug,
  //             created_at: product.createdAt,
  //             images: product.Product_Image.map((image) => {
  //               return image.fileId
  //             }),
  //           }
  //         })
  //       )
  //     }
  //   )
}
