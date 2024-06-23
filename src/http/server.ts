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
import { createStore } from './routes/create-store'
import { getProfile } from './routes/get-profile'
import { getStore } from './routes/get-store'
import { uploadImage } from './routes/images/upload-image'
import { getImage } from './routes/images/get-image'
import { deleteImage } from './routes/images/delete-image'
import { createProduct } from './routes/products/create-product'
import { getProducts } from './routes/products/get-products'
import { deleteProduct } from './routes/products/delete-product'
import { editProduct } from './routes/products/edit-product'
import { applyDiscountOnProduct } from './routes/products/apply-discount'

const app = fastify()

// Set custom error handler
app.setErrorHandler(errorHandler)

// Registration of fastify-type-provider-zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Registration of server components
app.register(cors, {
  origin: true,
  credentials: true,
})
app.register(cookie, {
  secret: env.JWT_AND_COOKIES_SIGN_SECRET,
  hook: 'onRequest',
})
app.register(jwt, {
  secret: env.JWT_AND_COOKIES_SIGN_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
})

// Routes registration
app.register(createUser)
app.register(createStore)
app.register(createProduct)
app.register(uploadImage)
app.register(auth)

app.register(editProduct)
app.register(applyDiscountOnProduct)

app.register(getProfile)
app.register(getStore)
app.register(getImage)
app.register(getProducts)

app.register(deleteImage)
app.register(deleteProduct)

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP Server running!')
  console.log('🔗 Server address: http://127.0.0.1:3333')
})
