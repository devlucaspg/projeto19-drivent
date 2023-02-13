import { getAllHotels, getHotelRooms } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getAllHotels)
  .get("/:hotelId", getHotelRooms);

export { hotelsRouter };
