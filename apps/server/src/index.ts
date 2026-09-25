import cors from 'cors'
import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './router.js'

const app = express()
const port = 4000

app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)
app.use(express.json())
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
  }),
)

app.listen(port, () => {
  console.log(`tRPC server listening on http://localhost:${port}/trpc`)
})
