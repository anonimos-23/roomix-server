import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getLoggedUser } from '../../middleware'
import { stripe } from '../../../lib/stripe'
import type Stripe from 'stripe'

export interface getStripeAccountResponse {
  isConnected: boolean
  account: Stripe.Response<Stripe.Account> | null
  payment: {
    stripeAccountId: string
    detailsSubmitted: boolean
  } | null
}

export async function getStripeAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/stripe/account',
    {
      schema: {
        querystring: z.object({
          storeId: z.string(),
          retrieveAccount: z.boolean().default(true).optional(),
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
      const input = request.query

      const falsyReturn = {
        isConnected: false,
        account: null,
        payment: null,
      }

      const retrieveAccount = input.retrieveAccount ?? true

      const store = await prisma.store.findUnique({
        where: {
          id: input.storeId,
        },
        select: {
          stripeAccountId: true,
        },
      })

      if (!store) return reply.status(400).send(falsyReturn)

      const payment = await prisma.payments.findFirst({
        where: {
          storeId: input.storeId,
        },
        select: {
          stripeAccountId: true,
          detailsSubmitted: true,
        },
      })

      if (!payment || !payment.stripeAccountId) {
        return reply.status(200).send(falsyReturn)
      }

      if (!retrieveAccount) {
        return reply.status(200).send({
          isConnected: true,
          account: null,
          payment,
        })
      }

      const account = await stripe.accounts.retrieve(payment.stripeAccountId)

      if (!account) {
        return reply.status(200).send(falsyReturn)
      }

      if (account.details_submitted && !payment.detailsSubmitted) {
        await prisma.$transaction(async (tx) => {
          await tx.payments.updateMany({
            where: {
              storeId: input.storeId,
            },
            data: {
              detailsSubmitted: account.details_submitted,
              stripeAccountCreatedAt: account.created
                ? new Date(account.created * 1000)
                : null,
            },
          })

          await tx.store.updateMany({
            where: {
              id: input.storeId,
            },
            data: {
              stripeAccountId: account.id,
            },
          })
        })
      }

      return reply.status(200).send({
        isConnected: payment.detailsSubmitted,
        account: account.details_submitted ? account : null,
        payment,
      })
    }
  )
}
