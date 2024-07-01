import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { getLoggedUser } from '../middleware'
import { stripe } from '../../lib/stripe'

export async function processCheckoutWithStripe(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/stripe/checkout',
    {
      schema: {
        body: z.object({
          products: z.array(
            z.object({
              images: z.array(z.string()),
              name: z.string(),
              price: z.number(),
              quantity: z.number(),
            })
          ),
          stripeAccountId: z.string(),
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
      const { products, stripeAccountId } = request.body

      const line_items = products.map(({ name, images, price, quantity }) => ({
        price_data: {
          currency: 'EUR',
          product_data: {
            name,
            images: images,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      }))

      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: 'http://localhost:5173/orders?stripe_success=true',
          cancel_url: 'http://localhost:5173/orders?stripe_success=false',
        },
        {
          stripeAccount: stripeAccountId,
        }
      )

      //   await prisma.shoppingCart.delete({
      //     where: {
      //       userId_productId: {
      //         userId,
      //         productId,
      //       },
      //     },
      //   })

      return reply.status(200).send({ id: session.id })
    }
  )
}
