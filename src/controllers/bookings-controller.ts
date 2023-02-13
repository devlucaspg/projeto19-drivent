import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import { bookRoom, changeHotelRooms, findUserBookings } from "@/services";
import httpStatus from "http-status";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const userBookings = await findUserBookings(userId);
    res.status(httpStatus.OK).send(userBookings);
  } catch (error) {
    res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { roomId } = req.body as Record<string, string>;
    const { userId } = req;
    const bookedRoom = await bookRoom(userId, Number(roomId));
    res.status(httpStatus.OK).send({ bookingId: bookedRoom.id });
  } catch (error) {
    if (error.name === "ForbiddenError") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    } else if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { bookingId } = req.params as Record<string, string>;
    const { roomId } = req.body as Record<string, string>;
    const { userId } = req;
    const newBookingId = await changeHotelRooms(userId, Number(bookingId), Number(roomId));
    res.status(httpStatus.OK).send({ bookingId: newBookingId.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    } else if (error.name === "ForbiddenError") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
