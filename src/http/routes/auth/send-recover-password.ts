import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { resend } from '../../../lib/resend'
import { RecoverPasswordEmail } from '../../../templates/recover-email'
import { BadRequest } from '../_errors/bad-request'
import { env } from '../../../env'

export async function sendRecoverPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/reset-password/send',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
        }),
        // response: {
        //   200: z.object({}),
        //   204: z.null(),
        // },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (user) {
        const token = app.jwt.sign(
          {
            userId: user.id,
          },
          {
            expiresIn: 15 * 60,
          }
        )

        await prisma.token.create({
          data: {
            type: 'RESET_PASSWORD',
            value: token,
            userId: user.id,
          },
        })

        await resend.emails.send({
          from: 'Roomix <reset-password@roomix.store>',
          to: email,
          subject: 'Recuperação de palavra-passe',
          react: RecoverPasswordEmail({
            userFirstname: user.firstName,
            resetPasswordLink: `${env.BASE_URL}/reset-password?code=${token}`,
          }),
        })
      }

      reply.status(201).send()
    }
  )
}
