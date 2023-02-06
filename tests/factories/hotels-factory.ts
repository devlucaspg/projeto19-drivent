import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { createRooms } from "./rooms-factory";

export function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
      Rooms: {
        createMany: {
          data: createRooms(),
        },
      },
    },
  });
}
