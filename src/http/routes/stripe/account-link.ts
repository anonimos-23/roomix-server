import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { stripe } from '../../../lib/stripe'
import axios from 'axios'
import { BadRequest } from '../_errors/bad-request'
import { getStripeAccountResponse } from './get-stripe-account'
import { env } from '../../../env'

export async function createAccountLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/stripe/account-link',
    {
      schema: {
        body: z.object({
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
      const { storeId, retrieveAccount } = request.body

      const { isConnected, account, payment } = await axios
        .get<getStripeAccountResponse>(
          `http://127.0.0.1:3333/stripe/account?storeId=${storeId}`
        )
        .then((response) => {
          return response.data
        })

      if (isConnected) {
        throw new BadRequest('Esta loja já está connectada ao Stripe')
      }

      if (account && !account.details_submitted) {
        await stripe.accounts.del(account.id)
      }

      const stripeAccountId =
        payment?.stripeAccountId ?? (await createStripeAccount())

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        return_url: `${env.BASE_URL}/dashboard/${storeId}/settings?stripe_redirect=true`,
        refresh_url: `${env.BASE_URL}/dashboard/${storeId}/settings?stripe_redirect=true`,
        type: 'account_onboarding',
      })

      if (!accountLink?.url) {
        return reply
          .status(409)
          .send('Erro na criação do link do Stripe, por favor tente novamente.')
      }

      return reply.status(201).send({
        data: {
          url: accountLink.url,
        },
        error: null,
      })

      async function createStripeAccount(): Promise<string> {
        const account = await stripe.accounts.create({ type: 'standard' })

        if (!account) {
          throw new Error('Error creating Stripe account.')
        }

        // If payment record exists, we update it with the new account id
        if (payment) {
          await prisma.payments.updateMany({
            where: {
              storeId,
            },
            data: {
              stripeAccountId: account.id,
            },
          })
        } else {
          await prisma.payments.create({
            data: {
              storeId,
              stripeAccountId: account.id,
            },
          })
        }

        return account.id
      }
    }
  )
}
