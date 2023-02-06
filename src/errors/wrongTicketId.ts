import { ApplicationError } from "@/protocols";

export function wrongTicketId(): ApplicationError {
  return {
    name: "WrongTicketId",
    message: "This ticketId doesn't exist.",
  };
}
