import Joi from "joi";

export const ticketCreationSchema = Joi.object<{ ticketTypeId: number }>({
  ticketTypeId: Joi.number().integer().required(),
});
