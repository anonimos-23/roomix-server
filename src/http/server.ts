import fastify from 'fastify'

const app = fastify()

app.listen({ port: 3333 }).then(() => {
    console.log('🚀 HTTP Server running!')
    console.log('🔗 Server address: http://127.0.0.1:3333')
})
