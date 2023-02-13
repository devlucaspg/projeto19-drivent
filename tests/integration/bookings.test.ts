import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from "../factories";
import { createBooking } from "../factories/bookings-factory";
import { createHotel } from "../factories/hotels-factory";
import { createBookedRoom } from "../factories/rooms-factory";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const api = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if there's no token", async () => {
    const response = await api.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 when token is invalid", async () => {
    const token = faker.lorem.word();
    const response = await api.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 when user doesn't have any reserves", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await api.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 200 and reserve info when user have reserves", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    await createBooking(user.id, hotel.Rooms[0].id);
    const response = await api.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        Room: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      }),
    );
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if there's no token", async () => {
    const response = await api.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 when token is invalid", async () => {
    const token = faker.lorem.word();
    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 403 when user doesn't have any enrollments, tickets or there aren't any hotels available", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const reserve = {
      roomId: 1,
    };
    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(reserve);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when user ticket wasn't paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when user ticket is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when user ticket doesn't include hotels", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(undefined, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 404 when roomId doesn't exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();

    const reserve = {
      roomId: 1000000,
    };

    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(reserve);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 when room is already booked", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const bookedRoom = await createBookedRoom(hotel.id);
    const reserve = {
      roomId: bookedRoom.id,
    };

    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(reserve);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 200 and bookingId", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();

    const reserve = {
      roomId: hotel.Rooms[0].id,
    };

    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(reserve);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(expect.objectContaining({ bookingId: expect.any(Number) }));
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if there's no token", async () => {
    const response = await api.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 when token is invalid", async () => {
    const token = faker.lorem.word();
    const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 403 when user doesn't have any reserves", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when room already booked", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const booking = await createBooking(user.id, hotel.Rooms[0].id);
    const bookedRoom = await createBookedRoom(hotel.id);

    const changedRoom = {
      roomId: bookedRoom.id,
    };

    const response = await api
      .put(`/booking/${booking.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(changedRoom);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 404 when roomId doesn't exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();

    const booking = await createBooking(user.id, hotel.Rooms[0].id);

    const reserve = {
      roomId: 100,
    };

    const response = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(reserve);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 200 and bookingId", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();

    const booking = await createBooking(user.id, hotel.Rooms[0].id);

    const reserve = {
      roomId: hotel.Rooms[2].id,
    };

    const response = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(reserve);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(expect.objectContaining({ bookingId: expect.any(Number) }));
  });
});
