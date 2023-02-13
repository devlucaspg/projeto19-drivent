import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbiddenError";
import { createBooking, findBooking, findRoom, findTicketInfo, updateRoom } from "@/repositories/bookings-repository";
import { Booking, Room } from "@prisma/client";

export async function bookRoom(userId: number, roomId: number): Promise<Booking> {
  await verifyUser(userId);
  await verifyRoom(roomId);
  const bookedRoom = await createBooking(userId, roomId);
  return bookedRoom;
}

export async function findUserBookings(userId: number): Promise<Pick<Booking, "id"> & { Room: Room }> {
  const booking = await findBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}

export async function changeHotelRooms(userId: number, bookingId: number, roomId: number): Promise<Booking> {
  await verifyUser(userId);
  await verifyRoom(roomId);
  await findUserBookings(userId);
  const newBookedRoom = await updateRoom(bookingId, roomId);
  return newBookedRoom;
}

async function verifyRoom(roomId: number) {
  const isValid = await findRoom(roomId);
  if (!isValid) throw notFoundError();
  if (isValid.capacity === 0) throw forbiddenError();
}

async function verifyUser(userId: number) {
  const isValid = (await findTicketInfo(userId)).pop();
  if (!isValid) throw forbiddenError();
  if (isValid.status !== "PAID" || !isValid.TicketType.includesHotel || isValid.TicketType.isRemote) {
    throw forbiddenError();
  }
}
