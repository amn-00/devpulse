const request = require("supertest");
const app = require("../src/app");
const { clearDatabase, closeConnections } = require("./setup");
jest.setTimeout(30000); // 30 seconds
beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeConnections();
});

describe("POST /api/auth/create-team", () => {
  it("creates a new team and manager account, returns a token", async () => {
    const res = await request(app).post("/api/auth/create-team").send({
      teamName: "Engineering Squad",
      name: "Aman Chaudhary",
      email: "aman@example.com",
      password: "securepass123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("manager");
    expect(res.body.team.invite_code).toHaveLength(8);
  });

  it("rejects duplicate email", async () => {
    const payload = {
      teamName: "Team A",
      name: "User One",
      email: "dup@example.com",
      password: "password123",
    };
    await request(app).post("/api/auth/create-team").send(payload);

    const res = await request(app)
      .post("/api/auth/create-team")
      .send({ ...payload, teamName: "Team B" });

    expect(res.statusCode).toBe(409);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/create-team")
      .send({ teamName: "Incomplete Team" });

    expect(res.statusCode).toBe(400);
  });

  it("rejects passwords shorter than 6 characters", async () => {
    const res = await request(app).post("/api/auth/create-team").send({
      teamName: "Team",
      name: "User",
      email: "short@example.com",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/auth/join-team", () => {
  it("allows a user to join with a valid invite code", async () => {
    const createRes = await request(app).post("/api/auth/create-team").send({
      teamName: "Open Team",
      name: "Manager",
      email: "manager@example.com",
      password: "password123",
    });
    const inviteCode = createRes.body.team.invite_code;

    const joinRes = await request(app).post("/api/auth/join-team").send({
      inviteCode,
      name: "New Member",
      email: "member@example.com",
      password: "password123",
    });

    expect(joinRes.statusCode).toBe(201);
    expect(joinRes.body.user.role).toBe("member");
    expect(joinRes.body.team.invite_code).toBe(inviteCode);
  });

  it("rejects an invalid invite code", async () => {
    const res = await request(app).post("/api/auth/join-team").send({
      inviteCode: "FAKECODE",
      name: "Someone",
      email: "someone@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/create-team").send({
      teamName: "Login Team",
      name: "User",
      email: "login@example.com",
      password: "correctpass",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "correctpass",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects incorrect password", async () => {
    await request(app).post("/api/auth/create-team").send({
      teamName: "Login Team 2",
      name: "User",
      email: "login2@example.com",
      password: "correctpass",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login2@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
  });

  it("rejects non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "anypass",
    });

    expect(res.statusCode).toBe(401);
  });
});
