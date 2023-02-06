import faker from "@faker-js/faker";

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
