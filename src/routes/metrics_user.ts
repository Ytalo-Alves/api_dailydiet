import type { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";
import { knex } from "../database";

export default function metricsUser(app: FastifyInstance) {
  app.get(
    "/countsnacks",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const user_id = request.user_id;

      const totalsnacks = await knex("snacks")
        .where({ user_id })
        .count<{ count: number }>("id as count")
        .first();

      return reply.status(200).send({
        totalsnacks: totalsnacks?.count || 0,
      });
    }
  );

  app.get(
    "/metrics/diet",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const user_id = request.user_id;

      const totalSnackWithInDiet = await knex("snacks")
        .where({ user_id, status_snack: "Dentro da dieta" })
        .count<{ count: number }>("id as count")
        .first();

      return reply.status(200).send({
        totalSnackWithInDiet: totalSnackWithInDiet?.count || 0,
      });
    }
  );

  app.get(
    "/metrics/offthediet",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const user_id = request.user_id;

      const totalSnackOffTheDiet = await knex("snacks")
        .where({ user_id, status_snack: "Fora da dieta" })
        .count<{ count: number }>("id as count")
        .first();

      return reply.status(200).send({
        totalSnackOffTheDiet: totalSnackOffTheDiet?.count || 0,
      });
    }
  );

  app.get(
    "/metrics/best-sequence",
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      try {
        const user_id = request.user_id;
  
        // Busca todas as refeições dentro da dieta do usuário, ordenadas pela data
        const snacks = await knex("snacks")
          .where({ user_id, status_snack: "Dentro da dieta" })
          .orderBy("created_at", "asc");
  
        // Verifica se não há refeições dentro da dieta
        if (!snacks || snacks.length === 0) {
          return reply.status(200).send({
            bestSequence: 0, // Nenhuma sequência encontrada
          });
        }
  
        let bestSequence = 0; // Melhor sequência encontrada
        let currentSequence = 0; // Sequência atual
  
        // Itera sobre as refeições para calcular a melhor sequência
        snacks.forEach((snack, index) => {
          // Converte created_at em um objeto Date
          const currentDate = new Date(snack.created_at);
  
          if (index === 0) {
            currentSequence = 1; // Primeira iteração, inicia a sequência
          } else {
            const previousDate = new Date(snacks[index - 1].created_at);
  
            // Verifica se a refeição atual é consecutiva (dentro de 1 dia)
            if (currentDate.getTime() - previousDate.getTime() <= 24 * 60 * 60 * 1000) {
              currentSequence++; // Continua a sequência
            } else {
              currentSequence = 1; // Reinicia a sequência
            }
          }
  
          // Atualiza a melhor sequência encontrada
          if (currentSequence > bestSequence) {
            bestSequence = currentSequence;
          }
        });
  
        return reply.status(200).send({
          bestSequence,
        });
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
