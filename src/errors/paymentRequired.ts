import { ApplicationError } from "@/protocols";

export function paymentRequired(): ApplicationError {
  return {
    name: "PaymentRequired",
    message: "Your ticket needs to be paid first!",
  };
}
