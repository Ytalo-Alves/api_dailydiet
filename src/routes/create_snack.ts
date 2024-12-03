import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {knex} from '../database'
import { randomUUID } from "crypto";
import {checkSessionIdExists} from '../middleware/check-session-id-exists'

export default function createSnack(app: FastifyInstance){
  app.post('/snack',{preHandler: checkSessionIdExists}, async (request, reply) => {
    const createSnackBodySchema = z.object({
      id: z.string().uuid(),
      user_id: z.string().uuid(),
      name: z.string().nullable(),
      description: z.string().nullable(),
      status_snack: z.string().nullable(),
      created_at: z.coerce.date().default(() => new Date()),
      updated_at: z.coerce.date().default(() => new Date())
    })

    const { name, description, status_snack, created_at, updated_at } = createSnackBodySchema.parse(request.body)

    const snack = await knex('snacks').insert({
      id: randomUUID(),
      name,
      description,
      status_snack,
      user_id: request.user_id,
      created_at,
      updated_at
    })

    return reply.status(201).send({success: true})
    
  })
}