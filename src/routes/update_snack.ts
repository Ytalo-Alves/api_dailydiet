import type { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";
import { z } from "zod";
import { knex } from "../database";

export default function updateSnack(app: FastifyInstance) {
  app.put(
    "/snack/:id",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const updateSnackBodySchema = z.object({
        name: z.string().nullable(),
        description: z.string().nullable(),
        status_snack: z.string().nullable(),
        created_at: z.coerce.date().default(() => new Date()),
        updated_at: z.coerce.date().default(() => new Date()),
      });

      const { name, description, status_snack, created_at, updated_at } = updateSnackBodySchema.parse(request.body);
      const { id } = request.params as { id: string };

      // Verificar se o snack pertence ao usuário autenticado
      const snack = await knex('snacks').where({ id }).first();

      if (!snack || snack.user_id !== request.user_id) {
        return reply.status(403).send({ error: "Unauthorized: You do not have permission to update this snack" });
      }

      await knex("snacks")
        .where({ id })
        .update({
          name,
          description,
          status_snack,
          updated_at,
        });

      return reply.status(200).send({ success: 'Meal updating successful' });
    }
  );
}
