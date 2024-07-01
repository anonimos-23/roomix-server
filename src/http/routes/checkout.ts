import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { getLoggedUser } from '../middleware'
import { resend } from '../../lib/resend'
import { Conflict } from './_errors/conflict'

export async function processCheckout(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/checkout',
    {
      schema: {
        body: z.object({
          storeId: z.string(),
          products: z.array(
            z.object({
              productId: z.string(),
              quantity: z.number(),
            })
          ),
          address: z.string(),
          country: z.string(),
          city: z.string(),
          province: z.string(),
          zipCode: z.string().regex(/^\d{4}-\d{3}?$/),
          notes: z.string().nullable(),
          totalAmount: z.number(),
          name: z.string(),
          email: z.string().email(),
        }),
        // response: {
        //   201: z.null(),
        //   401: z.object({
        //     message: z.string(),
        //   }),
        // },
      },
    },
    async (request, reply) => {
      const { userId } = await getLoggedUser(app, request)
      const {
        storeId,
        products,
        address,
        country,
        city,
        province,
        zipCode,
        notes,
        totalAmount,
        name,
        email,
      } = request.body

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new Conflict('O utilizador que está a fazer checkout não existe.')
      }

      const store = await prisma.store.findUnique({
        where: {
          id: storeId,
        },
      })

      if (!store) {
        throw new Conflict('A loja em que está a fazer o checkout não existe.')
      }

      let caneceledProductIds = []

      const productIds = products.map((product) => {
        return product.productId
      })

      const dbProducts = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      })

      const deletedCart = []

      for (let i = 0; i < productIds.length; i++) {
        const dbProduct = dbProducts.find((product) => {
          return product.id === productIds[i]
        })

        if (dbProduct === undefined) {
          continue
        }

        const product = products.find((product) => {
          return product.productId === productIds[i]
        })

        if (product === undefined) {
          continue
        }

        if (
          !dbProduct.canSellWithoutStock &&
          dbProduct.stock - product.quantity < 0
        ) {
          caneceledProductIds.push(product.productId)
          continue
        }

        deletedCart.push(
          await prisma.shoppingCart.delete({
            where: {
              userId_productId: {
                userId,
                productId: productIds[i],
              },
            },
          })
        )

        await prisma.product.update({
          where: {
            id: productIds[i],
          },
          data: {
            stock: dbProduct.stock - product.quantity,
          },
        })
      }

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          address,
          country,
          city,
          province,
          postal: zipCode,
          totalAmount,
          customerNotes: notes,
          customerName: name,
          customerEmail: email,
          currency: 'EUR',
        },
      })

      deletedCart.forEach(async (item) => {
        await prisma.orderItems.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        })
      })

      // await resend.emails.send({
      //   from: 'no-reply@roomix.store',
      //   to: user.email,
      //   subject: `Recibo do seu pagamento a ${store.name}`,
      //   react: '<h1>Teste</h1>',
      // })

      return reply.status(200).send({ caneceledProductIds })
    }
  )
}
