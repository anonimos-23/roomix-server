import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { prisma } from "../../lib/prisma";
import bcrypt from 'bcrypt'

export async function createUser(app: FastifyInstance) {
    app.post('/users', async (request, reply) => {
        const createUserSchema = z.object({
            email: z.string().email(),
            password: z.string(),
            firstName: z.string(),
            lastName: z.string().optional(),
        })

        const { email, password, firstName, lastName } = createUserSchema.parse(request.body)

        const doesUserExists = await prisma.users.findFirst({
            where: {
                email
            }
        })
        
        if (doesUserExists) {
            return reply.status(409).send({ message: 'Já existe uma conta associada a este e-mail' })
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds).catch((error) => {
            console.log('[create-user.ts] An error occurred while hashing the password: ', error)
            return reply.status(500).send({ message: 'Ocorreu um erro ao criar um novo utilizador! Tente novamente mais tarde.'})
        })

        const user = await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName
            }
        })

        return reply.status(201).send({ user })
    })
}