import fastify from 'fastify'
import multipart from '@fastify/multipart'
import { createUser } from './routes/create-user'
const app = fastify()

app.register(multipart)
app.register(createUser)

app.listen({ port: 3333 }).then(() => {
    console.log('🚀 HTTP Server running!')
    console.log('🔗 Server address: http://127.0.0.1:3333')
})
