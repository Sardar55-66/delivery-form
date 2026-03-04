import { z } from "zod";

const phoneRegex =
  /^(\+7|8)?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

export const step1Schema = z.object({
  senderName: z
    .string()
    .min(1, "Обязательное поле")
    .min(2, "Минимум 2 символа"),
  senderPhone: z
    .string()
    .min(1, "Обязательное поле")
    .regex(phoneRegex, "Неверный формат телефона"),
  senderCity: z.string().min(1, "Обязательное поле"),
});

export const step2BaseSchema = z.object({
  recipientName: z.string().min(1, "Обязательное поле"),
  recipientCity: z.string().min(1, "Обязательное поле"),
  cargoType: z.enum(["documents", "fragile", "regular"]),
  weight: z
    .number({ error: (iss) => (iss.input === undefined ? "Обязательное поле" : "Введите число") })
    .min(0.1, "Минимум 0.1 кг")
    .max(30, "Максимум 30 кг"),
});

export const createStep2Schema = (senderCity: string) =>
  step2BaseSchema.refine(
    (data) => data.recipientCity !== senderCity,
    {
      message: "Город назначения не может совпадать с городом отправления",
      path: ["recipientCity"],
    }
  );

export const step3Schema = z.object({
  agreed: z.literal(true, {
    error: "Необходимо согласие с условиями",
  }),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2BaseSchema>;
export type Step3Data = z.infer<typeof step3Schema>;
