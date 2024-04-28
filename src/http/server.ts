import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import {
  validatorCompiler,
  serializerCompiler,
} from 'fastify-type-provider-zod'
import { createUser } from './routes/create-user'
import { auth } from './routes/authentication'
import { env } from '../env'
import { errorHandler } from './error-handler'

const app = fastify()

// Set custom error handler
app.setErrorHandler(errorHandler)

// Registration of fastify-type-provider-zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Registration of server components
app.register(cors, {
  origin: 'http://localhost:5173',
})
app.register(cookie, {
  secret: env.JWT_AND_COOKIES_SIGN_SECRET,
  hook: 'onRequest',
})
app.register(jwt, {
  secret: env.JWT_AND_COOKIES_SIGN_SECRET,
})

// Routes registration
app.register(createUser)
app.register(auth)

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP Server running!')
  console.log('🔗 Server address: http://127.0.0.1:3333')
})
