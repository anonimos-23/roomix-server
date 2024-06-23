import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { r2 } from '../../../lib/cloudflare'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'

export async function deleteImage(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
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

      const file = await prisma.file.delete({
        where: {
          id,
        },
      })

      if (file === null) {
        throw new BadRequest('O ficheiro solicitado não existe.')
      }

      const command = new DeleteObjectCommand({
        Bucket: 'roomix-dev',
        Key: file.key,
      })

      await r2.send(command)

      return reply.status(204).send()
    }
  )
}
