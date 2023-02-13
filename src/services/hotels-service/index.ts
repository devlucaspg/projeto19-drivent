import { notFoundError } from "@/errors";
import { paymentRequired } from "@/errors/paymentRequired";
import { findHotelWithRooms, listAllHotels } from "@/repositories/hotels-repository";
import { findUserTickets } from "@/repositories/tickets-repository";
import { Hotel, Room, Ticket, TicketType } from "@prisma/client";

export async function findHotels(userId: number): Promise<Hotel[]> {
  await userRequirements(userId);
  return await listAllHotels();
}

export async function findHotel(userId: number, hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  await userRequirements(userId);
  return await findHotelWithRooms(hotelId);
}

async function userRequirements(userId: number): Promise<Ticket & { TicketType: TicketType }> {
  const userTicket = await findUserTickets(userId);
  if (!userTicket) throw notFoundError();
  if (userTicket.status !== "PAID" || !userTicket.TicketType.includesHotel || userTicket.TicketType.isRemote) {
    throw paymentRequired();
  }
  return userTicket;
}
