import { prisma } from "@/config";
import { Booking, PrismaPromise, Room, TicketStatus, TicketType } from "@prisma/client";

export function createBooking(userId: number, roomId: number): PrismaPromise<Booking> {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export function findBooking(userId: number): PrismaPromise<Pick<Booking, "id"> & { Room: Room }> {
  return prisma.booking.findFirst({ select: { id: true, Room: true }, where: { userId } });
}

export function findRoom(roomId: number): PrismaPromise<Room> {
  return prisma.room.findFirst({ where: { id: roomId } });
}

export function findTicketInfo(userId: number): PrismaPromise<TicketInfoReturnType[]> {
  return prisma.ticket.findMany({
    select: { TicketType: { select: { isRemote: true, includesHotel: true } }, status: true },
    where: { Enrollment: { userId } },
  });
}

export function updateRoom(bookingId: number, roomId: number): PrismaPromise<Booking> {
  return prisma.booking.update({ where: { id: bookingId }, data: { roomId } });
}

type TicketInfoReturnType = {
  TicketType: Pick<TicketType, "isRemote" | "includesHotel">;
  status: TicketStatus;
};
