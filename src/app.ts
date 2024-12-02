import fastify from "fastify";
import CreateUser from "./routes/create_user";

export const app = fastify();

app.register(CreateUser)
