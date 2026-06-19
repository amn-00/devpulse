const request = require("supertest");
const app = require("../src/app");
const { clearDatabase, closeConnections } = require("./setup");
jest.setTimeout(30000); // 30 seconds
let token;
let teamId;

async function setupTeamAndUser() {
  const res = await request(app).post("/api/auth/create-team").send({
    teamName: "Test Team",
    name: "Test Manager",
    email: "testmanager@example.com",
    password: "password123",
  });
  return { token: res.body.token, teamId: res.body.team.id };
}

beforeEach(async () => {
  await clearDatabase();
  const auth = await setupTeamAndUser();
  token = auth.token;
  teamId = auth.teamId;
});

afterAll(async () => {
  await closeConnections();
});

describe("POST /api/standup", () => {
  it("creates a standup entry without a blocker", async () => {
    const res = await request(app)
      .post("/api/standup")
      .set("Authorization", `Bearer ${token}`)
      .send({
        yesterday: "Set up the project repo",
        today: "Build the auth flow",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.entry.has_blocker).toBe(false);
  });

  it("creates a standup entry with a blocker and stores it separately", async () => {
    const res = await request(app)
      .post("/api/standup")
      .set("Authorization", `Bearer ${token}`)
      .send({
        yesterday: "Worked on API",
        today: "Fix the deploy pipeline",
        blockerDescription: "CI pipeline failing on Docker build step",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.entry.has_blocker).toBe(true);
  });

  it("rejects entry missing required fields", async () => {
    const res = await request(app)
      .post("/api/standup")
      .set("Authorization", `Bearer ${token}`)
      .send({ yesterday: "Only this field" });

    expect(res.statusCode).toBe(400);
  });

  it("rejects request without a valid token", async () => {
    const res = await request(app).post("/api/standup").send({
      yesterday: "Test",
      today: "Test",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/dashboard", () => {
  it("returns team dashboard with member list and blocker info", async () => {
    await request(app)
      .post("/api/standup")
      .set("Authorization", `Bearer ${token}`)
      .send({
        yesterday: "Day 1 work",
        today: "Day 2 plan",
        blockerDescription: "Waiting on design review",
      });

    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.teamMembers).toHaveLength(1);
    expect(res.body.teamMembers[0].postedToday).toBe(true);
    expect(res.body.activeBlockers).toHaveLength(1);
    expect(res.body.cached).toBe(false);
  });

  it("serves cached response on second call within TTL", async () => {
    await request(app)
      .post("/api/standup")
      .set("Authorization", `Bearer ${token}`)
      .send({ yesterday: "Work", today: "More work" });

    await request(app).get("/api/dashboard").set("Authorization", `Bearer ${token}`);

    const secondRes = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(secondRes.body.cached).toBe(true);
  });
});

describe("PATCH /api/blockers/:id/resolve", () => {
  it("marks a blocker as resolved and removes it from active list", async () => {
    const entryRes = await request(app)
      .post("/api/standup")
      .set("Authorization", `Bearer ${token}`)
      .send({
        yesterday: "Work",
        today: "More work",
        blockerDescription: "Blocked on access permissions",
      });

    const dashboardRes = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);
    const blockerId = dashboardRes.body.activeBlockers[0].id;

    const resolveRes = await request(app)
      .patch(`/api/blockers/${blockerId}/resolve`)
      .set("Authorization", `Bearer ${token}`);

    expect(resolveRes.statusCode).toBe(200);
    expect(resolveRes.body.blocker.is_resolved).toBe(true);

    const updatedDashboard = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(updatedDashboard.body.activeBlockers).toHaveLength(0);
  });

  it("returns 404 for a non-existent blocker", async () => {
    const res = await request(app)
      .patch("/api/blockers/99999/resolve")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
