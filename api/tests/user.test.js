const mongoose = require("mongoose");
const request = require("supertest");
const app = require("./app");
const User = require("../models/user");

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
  await User.deleteMany();
});

afterEach(async () => {
  await mongoose.connection.close();
});

describe("POST /auth/signup", () => {
  it("should create a user", async () => {
    const res = await request(app).post("/auth/signup").send({
      first_name: "John",
      last_name: "Doe",
      username: "JohnDoe",
      email: "JohnDoe@gmail.com",
      password: "john123",
      confirm_password: "john123",
      admin: "@dm1n",
    });
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/users?page=1&limit=3", () => {
  it("should return results of first page users", async () => {
    const res = await request(app).get("/api/users?page=1&limit=3");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBeTruthy();
  });
});

describe("Create, Login Then PUT /api/users/:id", () => {
  it("should create, login and receive token then update user", async () => {
    const res = await request(app).post("/auth/signup").send({
      first_name: "Bob",
      last_name: "Mob",
      username: "BobMob",
      email: "bob@gmail.com",
      password: "bob12345",
      confirm_password: "bob12345",
      admin: "@dm1n",
    });
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .post("/auth/login")
      .send({ email: "bob@gmail.com", password: "bob12345" });

    expect(res2.body.accessToken).toBeTruthy();
    expect(res2.statusCode).toBe(200);

    const token = res2.body.accessToken;

    const user = await User.findOne({ email: "bob@gmail.com" });

    const res3 = await request(app)
      .put(`/api/users/${user._id}`)
      .send({
        first_name: "Bob",
        last_name: "Mob",
        username: "BobMob2",
        email: "bob@gmail.com",
        password: "bob12345",
        confirm_password: "bob12345",
        admin: "@dm1n",
        _id: user._id,
      })
      .set({ Authorization: "bearer " + token });
    expect(res3.statusCode).toBe(200);
  });
});
