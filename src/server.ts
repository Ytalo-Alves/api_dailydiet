import fastify from "fastify";
import { env } from "./env";

const app = fastify();

app.get('/hello', (req, res) => {
  console.log('hello word')
})

app.listen({port: env.PORT}).then(() => {
  console.log('server is running on port ' + env.PORT)
})