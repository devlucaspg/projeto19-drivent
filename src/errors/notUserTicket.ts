import { ApplicationError } from "@/protocols";

export function notUserTicket(): ApplicationError {
  return {
    name: "NotUserTicket",
    message: "This ticket is not yours.",
  };
}
