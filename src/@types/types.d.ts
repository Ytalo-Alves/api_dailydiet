import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user_id?: string; // Adiciona a propriedade user_id
  }
}
