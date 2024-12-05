import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

export default function createSnack(app: FastifyInstance) {
  app.post(
    "/snack",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const createSnackBodySchema = z.object({
        name: z.string().nullable(),
        description: z.string().nullable(),
        status_snack: z.string().nullable(),
        created_at: z.coerce.date().default(() => new Date()),
        updated_at: z.coerce.date().default(() => new Date()),
      });

      const { name, description, status_snack, created_at, updated_at } =
        createSnackBodySchema.parse(request.body);

      if (!request.user_id) {
        return reply
          .status(401)
          .send({ error: "Unauthorized: missing user_id" });
      }

      await knex("snacks").insert({
        id: randomUUID(),
        name,
        description,
        status_snack,
        user_id: request.user_id, // Pega o user_id do middleware
        created_at,
        updated_at,
      });

      return reply.status(201).send({ success: "Snack creating successful" });
    }
  );

  app.delete(
    "/snack/:id",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const snack = await knex("snacks").where({ id }).first();

      if (!snack) {
        return reply.status(404).send({ error: "Snack not found" });
      }

      if (snack.user_id !== request.user_id) {
        return reply
          .status(403)
          .send({ error: "Forbidden: Not authorized to delete this snack" });
      }

      await knex("snacks").where({ id }).del();

      return reply.status(200).send({ success: "Snack deleted successfully" });
    }
  );

  app.get(
    "/snack",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const user_id = request.user_id;

      const snacks = await knex("snacks").where({ user_id: user_id }).select();

      return reply.status(200).send({ snacks });
    }
  );

  app.get(
    "/snack/:id",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {

      const { id } = request.params as {id: string};
      const user_id = request.user_id;

      const snacks = await knex("snacks").where({ user_id: user_id, id: id }).select();

      return reply.status(200).send({ snacks });
    }
  );
  
}
