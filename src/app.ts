import fastify from "fastify";
import CreateUser from "./routes/create_user";
import cookie from '@fastify/cookie'
import createSnack from "./routes/create_snack";
import updateSnack from "./routes/update_snack";

export const app = fastify();

app.register(cookie)
app.register(CreateUser)
app.register(createSnack)
app.register(updateSnack)
