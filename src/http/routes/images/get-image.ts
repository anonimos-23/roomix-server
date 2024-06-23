import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { r2 } from '../../../lib/cloudflare'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function getImage(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/uploads/:id',
    {
      schema: {
        params: z.object({
          id: z.string().cuid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const file = await prisma.file.findUnique({
        where: {
          id,
        },
      })

      if (file === null) {
        throw new BadRequest('O ficheiro solicitado não existe.')
      }

      const imageUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: 'roomix-dev',
          Key: file.key,
        }),
        { expiresIn: 300 }
      )

      return reply.status(200).send({ imageUrl })
    }
  )
}
