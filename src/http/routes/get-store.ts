import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getLoggedUser } from '../middleware'

export async function getStore(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/stores',
    {
      schema: {
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            country: z.string(),
            shippingAddress: z.string().nullable(),
            slogan: z.string().nullable(),
            slug: z.string(),
            settings: z
              .object({
                needEmailOnSale: z.boolean(),
                needNameOnSale: z.boolean(),
                needPhoneOnSale: z.boolean(),
              })
              .nullable(),
            createdAt: z.date(),
          }),
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { userId } = await getLoggedUser(app, request)

      const store = await prisma.store.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          shippingAddress: true,
          slogan: true,
          slug: true,
          storeSettings: {
            select: {
              needCustomerEmail: true,
              needCustomerName: true,
              needCustomerPhone: true,
            },
          },
          createdAt: true,
        },
      })

      if (store === null) {
        return reply.status(204).send()
      }

      return reply.status(200).send({
        id: store.id,
        name: store.name,
        email: store.email,
        country: store.country,
        shippingAddress: store.shippingAddress,
        slogan: store.slogan,
        slug: store.slug,
        settings:
          store.storeSettings !== null
            ? {
                needEmailOnSale: store.storeSettings.needCustomerEmail,
                needNameOnSale: store.storeSettings.needCustomerName,
                needPhoneOnSale: store.storeSettings.needCustomerPhone,
              }
            : null,
        createdAt: store.createdAt,
      })
    }
  )
}
