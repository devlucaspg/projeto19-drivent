import { getBookings, postBooking, putBooking } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter.all("/*", authenticateToken);
bookingsRouter.get("/", getBookings);
bookingsRouter.post("/", postBooking);
bookingsRouter.put("/:bookingId", putBooking);

export { bookingsRouter };
