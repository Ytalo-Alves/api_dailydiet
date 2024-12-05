import type { FastifyReply, FastifyRequest } from "fastify";
import { knex } from '../database';

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  console.log('Session ID:', sessionId);

  if (!sessionId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const user = await knex('users').where('session_id', sessionId).first();

  if (!user) {
    return reply.status(401).send({ error: "User not found" });
  }

  // Adiciona o user_id ao request
  request.user_id = user.id;
}
