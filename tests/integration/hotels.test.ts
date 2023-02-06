import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { Hotel, Room, TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket } from "../factories";
import { createHotel } from "../factories/hotels-factory";
import { cleanDb, generateToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 when don't have token", async () => {
    const response = await api.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 when invalid token", async () => {
    const token = faker.lorem.word();
    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 when user doesn't have enrollments/tickets or hotels available", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 402 when unpaid user ticket", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when user ticket is remote", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when user ticket don't include hotel", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(undefined, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with hotels list", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual<Hotel[]>(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 when don't have token", async () => {
    const response = await api.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 when invalid token", async () => {
    const token = faker.lorem.word();
    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 when user doesn't have enrollments/tickets or hotels available", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 402 when unpaid user ticket", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when user ticket is remote", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when user ticket don't include hotel", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(undefined, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with the hotel and the rooms", async () => {
    const user = await createUser();
    const token = await generateToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual<Hotel & { Rooms: Room[] }>(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        Rooms: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: 1,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });
});
