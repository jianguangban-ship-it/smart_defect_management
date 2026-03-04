import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db/connection.js'
import { healthRoutes } from './routes/health.js'
import { defectRoutes } from './routes/defects.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const server = Fastify({ logger: true })

await server.register(cors, { origin: true })

// API routes
await server.register(healthRoutes, { prefix: '/api' })
await server.register(defectRoutes, { prefix: '/api' })

// Serve static SPA in production
if (process.env.NODE_ENV === 'production') {
  const distPath = resolve(__dirname, '..', 'dist')
  await server.register(fastifyStatic, { root: distPath })

  // SPA fallback: serve index.html for all non-API routes
  server.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api')) {
      reply.code(404).send({ error: 'Not found' })
    } else {
      reply.sendFile('index.html')
    }
  })
}

// Initialize database and start server
initDb()

const port = parseInt(process.env.PORT || '3001', 10)
const host = process.env.HOST || '0.0.0.0'

try {
  await server.listen({ port, host })
  console.log(`Server running at http://localhost:${port}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
