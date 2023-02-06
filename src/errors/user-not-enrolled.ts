import { ApplicationError } from "@/protocols";

export function userNotEnrolled(): ApplicationError {
  return {
    name: "UserNotEnrolled",
    message: "You don't have any enrollments.",
  };
}
