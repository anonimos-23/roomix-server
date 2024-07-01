import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import {
  validatorCompiler,
  serializerCompiler,
} from 'fastify-type-provider-zod'
import { env } from '../env'
import { createUser } from './routes/create-user'
import { auth } from './routes/auth/authentication'
import { sendRecoverPassword } from './routes/auth/send-recover-password'
import { errorHandler } from './error-handler'
import { createStore } from './routes/store/create-store'
import { getProfile } from './routes/get-profile'
import { getStore } from './routes/store/get-store'
import { uploadImage } from './routes/images/upload-image'
import { getImage } from './routes/images/get-image'
import { deleteImage } from './routes/images/delete-image'
import { createProduct } from './routes/products/create-product'
import { getProducts } from './routes/products/get-products'
import { deleteProduct } from './routes/products/delete-product'
import { editProduct } from './routes/products/edit-product'
import { applyDiscountOnProduct } from './routes/products/apply-discount'
import { addProductToCart } from './routes/shopping-cart/add-item'
import { deleteProductFromCart } from './routes/shopping-cart/delete-item'
import { getCart } from './routes/shopping-cart/get-cart'
import { editProductFromCart } from './routes/shopping-cart/edit-item'
import { getProduct } from './routes/products/get-product'
import { createAccountLink } from './routes/stripe/account-link'
import { getStripeAccount } from './routes/stripe/get-stripe-account'
import { processCheckout } from './routes/checkout'
import { getOrders } from './routes/orders/get-orders'
import { createFaq } from './routes/store/faq/create-faq'
import { deleteFaq } from './routes/store/faq/delete-faq'
import { editFaq } from './routes/store/faq/edit-faq'
import { getFaqs } from './routes/store/faq/get-faqs'
import { getStores } from './routes/store/get-stores'
import { getAllProducts } from './routes/products/get-all-products'
import { editOrderStatus } from './routes/orders/edit-status'
import { resetPassword } from './routes/auth/reset-password'

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

// Routes registration //

// Creation routes
app.register(createUser)
app.register(createStore)
app.register(createProduct)
app.register(addProductToCart)
app.register(processCheckout)
app.register(createFaq)
app.register(uploadImage)

app.register(auth)
app.register(resetPassword)
app.register(sendRecoverPassword)

// Stripe
app.register(createAccountLink)
app.register(getStripeAccount)

// Edit routes
app.register(editProduct)
app.register(applyDiscountOnProduct)
app.register(editProductFromCart)
app.register(editFaq)
app.register(editOrderStatus)

// Get routes
app.register(getProfile)
app.register(getStore)
app.register(getImage)
app.register(getProduct)
app.register(getProducts)
app.register(getCart)
app.register(getOrders)
app.register(getFaqs)
app.register(getStores)
app.register(getAllProducts)

// Delete routes
app.register(deleteImage)
app.register(deleteProduct)
app.register(deleteProductFromCart)
app.register(deleteFaq)

// Utilities

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP Server running!')
  console.log('🔗 Server address: http://127.0.0.1:3333')
})
