import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { hash } from 'bcrypt'

export default function CreateUser(app: FastifyInstance) {
  const createUserBodySchema = z.object({
    name: z.string().nullable(),
    email: z.string().email().nullable(),
    password: z.string().nullable(),
    genre: z.string().nullable(),
    age: z.coerce.number().nullable(),
    created_at: z.coerce.date().default(() => new Date()),
    updated_at: z.coerce.date().default(() => new Date()),
  });

  app.post("/users", async (request, reply) => {
    const { name, email, password, genre, age, created_at, updated_at } =
      createUserBodySchema.parse(request.body);

      let sessionId = request.cookies.sessionId

      if(!sessionId) {
        sessionId = randomUUID()
        reply.setCookie('sessionId', sessionId,{
          path: '/',
          maxAge: 60 * 60
        })
      }

    const emailExists = await knex("users").where({ email }).first();

    if (emailExists) {
      return reply.status(400).send({ error: "email is already in use" });
    }

    if (!password) {
      throw new Error("Password cannot be null");
    }
    const passwordHash = hash(password, 10)


    await knex("users").insert({
      id: randomUUID(),
      name,
      email,
      password: passwordHash,
      genre,
      age,
      created_at,
      updated_at,
      session_id: sessionId
    });


    return reply
      .status(201)
      .send({ message: "User created successfully"});
  });

  app.get('/users', async (request, reply) => {

    const users = await knex('users').select('*')

    return reply.send(users)

  })
}
