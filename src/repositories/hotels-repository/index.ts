import { prisma } from "@/config";
import { Hotel, PrismaPromise, Room } from "@prisma/client";

export function listAllHotels(): PrismaPromise<Hotel[]> {
  return prisma.hotel.findMany({});
}

export function findHotelWithRooms(hotelId: number): PrismaPromise<Hotel & { Rooms: Room[] }> {
  return prisma.hotel.findFirst({ where: { id: hotelId }, include: { Rooms: true } });
}
