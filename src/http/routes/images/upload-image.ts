import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { r2 } from '../../../lib/cloudflare'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { generateSlug } from '../../../utils/generate-slug'

export async function uploadImage(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/uploads',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          contentType: z.string().regex(/^(image)\/[a-zA-Z]+/),
          type: z.enum(['avatar', 'storeLogo', 'storeBanner', 'storeProduct']),
          entityId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, contentType, type, entityId } = request.body

      const normalizedFileName = generateSlug(name)

      const fileKey = randomUUID().concat('_').concat(normalizedFileName)

      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: 'roomix-dev',
          Key: fileKey,
          ContentType: contentType,
        }),
        { expiresIn: 300 }
      )

      const { id } = await prisma.file.create({
        data: {
          name,
          contentType,
          key: fileKey,
          type,
        },
      })

      if (type === 'storeProduct') {
        await prisma.product_Image.create({
          data: {
            fileId: id,
            productId: entityId,
          },
        })
      }

      if (type === 'storeLogo' || type === 'storeBanner') {
        await prisma.store_Image.create({
          data: {
            fileId: id,
            storeId: entityId,
          },
        })
      }

      if (type === 'avatar') {
        await prisma.user.update({
          data: {
            fileId: id,
          },
          where: {
            id: entityId,
          },
        })
      }

      return reply.status(201).send({ signedUrl, fileId: id })
    }
  )
}
