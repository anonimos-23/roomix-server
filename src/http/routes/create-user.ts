import { FastifyInstance } from "fastify";
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { prisma } from "../../lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from "../../lib/cloudflare";

export async function createUser(app: FastifyInstance) {
    app.post('/users', async (request, reply) => {
        const createUserSchema = z.object({
            email: z.string().email(),
            password: z.string(),
            name: z.string(),
            avatarUrl: z.string().optional(),
            phone: z.string().optional(),
            gender: z.string().optional()
        })

        const { email, password, name, avatarUrl, phone, gender } = createUserSchema.parse(request.body)

        const user = await prisma.users.create({
            data: {
                email,
                password,
                name,
                avatar: avatarUrl,
                phone,
                gender
            }
        })

        return reply.status(201).send({ user })
    })

    app.post('/uploads/avatar', async (request, reply) => {
        const uploadBodySchema = z.object({
            name: z.string().min(1),
            contentType: z.string().regex(/^(image)\/[a-zA-Z]+/)
        })

        const { name, contentType } = uploadBodySchema.parse(request.body)

        const fileKey = randomUUID().concat('_').concat(name)

        const signedUrl = await getSignedUrl(
            r2,
            new PutObjectCommand({
                Bucket: 'roomix-dev',
                Key: fileKey,
                ContentType: contentType
            }),
            { expiresIn: 300 },
        )

        return reply.status(201).send({ signedUrl })
    })
}