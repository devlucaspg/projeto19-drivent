import { PaymentRequestInput } from "@/protocols";
import Joi from "joi";

const validateCreditCard = (value: number) => {
  if (value.toString().length !== 16) {
    throw new Error("Invalid credit card number format");
  }
  return value;
};

const validateCvv = (value: number) => {
  if (value.toString().length !== 3) {
    throw new Error("Invalid CVV format");
  }
};

export const paymentRequestSchema = Joi.object<PaymentRequestInput>({
  ticketId: Joi.number().integer().required(),
  cardData: Joi.object<CreditCard>({
    issuer: Joi.string().required(),
    number: Joi.number().integer().positive().custom(validateCreditCard).required(),
    name: Joi.string().min(3).required(),
    expirationDate: Joi.date().required(),
    cvv: Joi.number().integer().custom(validateCvv).required(),
  }),
});

type CreditCard = {
  issuer: string;
  number: number;
  name: string;
  expirationDate: Date;
  cvv: number;
};
