import { prisma } from "@/config";
import { PaymentInfoType } from "@/protocols";

export function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId },
  });
}

export function createTicketPayment(paymentInfo: PaymentInfoType) {
  return prisma.payment.create({ data: { ...paymentInfo } });
}

export function getTicketValue(ticketId: number) {
  return prisma.ticket.findFirst({ select: { TicketType: { select: { price: true } } }, where: { id: ticketId } });
}

export function updateTicketStatus(ticketId: number) {
  return prisma.ticket.update({ where: { id: ticketId }, data: { status: "PAID" } });
}
