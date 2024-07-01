import { FastifyInstance } from 'fastify'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

interface TStore {
  id: string
  slug: string
  name: string
  slogan: string | null
  email: string
  country: string
  shippingAddress: string | null
  images: {
    logoId: string | undefined
    bannerId: string | undefined
  }
  created_at: string
}

export async function getStores(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/stores/all', async (_request, reply) => {
      const dbStores = await prisma.store.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          shippingAddress: true,
          slogan: true,
          slug: true,
          Store_Image: {
            select: {
              fileId: true,
              file: {
                select: {
                  type: true,
                },
              },
            },
          },
          createdAt: true,
        },
      })

      let stores: TStore[] = []

      dbStores.forEach((store) => {
        let logoId
        let bannerId

        if (store.Store_Image[0]) {
          if (store.Store_Image[0].file.type === 'storeLogo') {
            logoId = store.Store_Image[0].fileId
          } else if (store.Store_Image[0].file.type === 'storeBanner') {
            bannerId = store.Store_Image[0].fileId
          }
        }

        if (store.Store_Image[1]) {
          if (store.Store_Image[1].file.type === 'storeLogo') {
            logoId = store.Store_Image[1].fileId
          } else if (store.Store_Image[1].file.type === 'storeBanner') {
            bannerId = store.Store_Image[1].fileId
          }
        }

        stores.push({
          id: store.id,
          name: store.name,
          email: store.email,
          country: store.country,
          shippingAddress: store.shippingAddress,
          slogan: store.slogan,
          slug: store.slug,
          images: {
            logoId,
            bannerId,
          },
          created_at: store.createdAt.toISOString(),
        })
      })

      return reply.status(200).send(stores)
    })
}
