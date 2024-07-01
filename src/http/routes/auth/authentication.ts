import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcrypt'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequest } from './../_errors/bad-request'
import { Unauthorized } from './../_errors/unauthorized'
import { Forbidden } from './../_errors/forbidden'

export interface AuthTokenPayload {
  userId: string
  storeId: string | null
}

export async function auth(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/login',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
        response: {
          201: z.object({
            accessToken: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          password: true,
          store: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!user) {
        throw new BadRequest('Email ou password inválidos')
      }

      const doesPasswordMatch = await bcrypt.compare(password, user.password)

      if (!doesPasswordMatch) {
        throw new BadRequest('Email ou password inválidos')
      }

      const refreshToken = app.jwt.sign(
        {
          userId: user.id,
          storeId: user.store !== null ? user.store.id : null,
        },
        {
          expiresIn: '30d',
        }
      )

      const accessToken = app.jwt.sign(
        {
          userId: user.id,
          storeId: user.store !== null ? user.store.id : null,
        },
        {
          expiresIn: '15m',
        }
      )

      return reply
        .status(201)
        .setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 30 * 24 * 60 * 60,
          sameSite: 'none',
          path: '/',
        })
        .send({ accessToken })
    }
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/auth/logout',
    {
      schema: {
        response: {
          200: z.object({
            accessToken: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      return reply
        .status(200)
        .setCookie('refreshToken', 'none', {
          httpOnly: true,
          secure: true,
          maxAge: 5,
          sameSite: 'none',
          path: '/',
        })
        .send()
    }
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/refresh-token',
    {
      schema: {
        response: {
          201: z.object({
            accessToken: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
          403: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.cookies

      if (!refreshToken) {
        throw new Unauthorized()
      }

      const payload = app.jwt.decode<AuthTokenPayload>(refreshToken)

      if (payload === null) {
        throw new Forbidden()
      }

      const newAccessToken = app.jwt.sign(
        {
          userId: payload.userId,
          storeId: payload.storeId,
        },
        {
          expiresIn: '15m',
        }
      )

      return reply.status(201).send({ accessToken: newAccessToken })
    }
  )
}
