import faker from "@faker-js/faker";
import { prisma } from "@/config";

export function createRooms() {
  const rooms = [];
  for (let i = 0; i < 10; i++) {
    rooms.push({
      name: faker.name.findName(),
      capacity: faker.datatype.number({  min: 1, max: 4 }),
    });
  }
  return rooms;
}

export function createBookedRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 0,
      hotelId,
    },
  });
}
