import { prisma } from "@/config";
import { PrismaPromise, TicketType, Ticket, Enrollment } from "@prisma/client";

export function findTypes(): PrismaPromise<TicketType[]> {
  return prisma.ticketType.findMany();
}

export function findTicket(ticketId: number) {
  return prisma.ticket.findFirst({ where: { id: ticketId } });
}

export function findUserTickets(userId: number): PrismaPromise<Ticket & { TicketType: TicketType }> {
  return prisma.ticket.findFirst({ where: { Enrollment: { userId } }, include: { TicketType: true } });
}

export function findEnrollment(userId: number): PrismaPromise<Enrollment> {
  return prisma.enrollment.findUnique({ where: { userId } });
}

export function createUserTicket(typeId: number, userId: number): PrismaPromise<Ticket> {
  return prisma.ticket.create({
    data: {
      TicketType: {
        connectOrCreate: {
          where: { id: typeId },
          create: { name: "a", price: 90, isRemote: false, includesHotel: true },
        },
      },
      Enrollment: { connect: { userId } },
      status: "RESERVED",
    },
    include: { TicketType: true },
  });
}
