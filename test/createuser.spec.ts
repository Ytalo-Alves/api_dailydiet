import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import request from "supertest";
import { app } from "../src/app";
import { knex } from "../src/database";

describe("User routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();

    await knex.destroy();
  });

  beforeEach(async () => {
    await knex("users").truncate();
  });


  it("should be able to create a new user", async () => {
    const response = await request(app.server)
      .post("/users")
      .send({
        name: "Ytalo Alves",
        email: "ytaloalves10@hotmail.com",
        password: "12345678",
        genre: "Masculino",
        age: 27,
      })
      .expect(201);

    // Verifica o retorno de sucesso
    expect(response.body).toHaveProperty(
      "message",
      "User created successfully"
    );
    expect(response.body).toHaveProperty("user");
  });

  it("should return an error if the email is already in use", async () => {
    // Cria o primeiro usuário
    await request(app.server)
      .post("/users")
      .send({
        name: "Ytalo Alves",
        email: "ytaloalves10@hotmail.com",
        password: "12345678",
        genre: "Masculino",
        age: 27,
      })
      .expect(201);

    // Tenta criar outro usuário com o mesmo e-mail
    const response = await request(app.server)
      .post("/users")
      .send({
        name: "Outro Nome",
        email: "ytaloalves10@hotmail.com",
        password: "987654321",
        genre: "Feminino",
        age: 30,
      })
      .expect(400);

    // Verifica o retorno de erro
    expect(response.body).toHaveProperty("error", "email is already in use");
  });
});
