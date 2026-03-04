"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Stepper } from "./Stepper";
import { step1Schema, createStep2Schema, step3Schema } from "@/lib/schema";
import { addOrder } from "@/lib/storage";
import type { OrderFormData } from "@/lib/types";
import { CARGO_LABELS } from "@/lib/constants";
import { formatPhoneForDisplay, parsePhoneInput } from "@/lib/phone";

const initialFormData: OrderFormData = {
  senderName: "",
  senderPhone: "",
  senderCity: "",
  recipientName: "",
  recipientCity: "",
  cargoType: "regular",
  weight: 1,
};

export const DeliveryForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const handleNext = useCallback(() => {
    if (step === 1) {
      const result = step1Schema.safeParse({
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderCity: formData.senderCity,
      });
      if (!result.success) {
        const flat = z.flattenError(result.error);
        const fieldErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(flat.fieldErrors)) {
          if (Array.isArray(v) && v[0]) fieldErrors[k] = String(v[0]);
        }
        setErrors(fieldErrors);
        return;
      }
    }

    if (step === 2) {
      const schema = createStep2Schema(formData.senderCity);
      const result = schema.safeParse({
        recipientName: formData.recipientName,
        recipientCity: formData.recipientCity,
        cargoType: formData.cargoType,
        weight: formData.weight,
      });
      if (!result.success) {
        const flat = z.flattenError(result.error);
        const fieldErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(flat.fieldErrors)) {
          if (Array.isArray(v) && v[0]) fieldErrors[k] = String(v[0]);
        }
        setErrors(fieldErrors);
        return;
      }
    }

    setErrors({});
    if (step < 3) setStep((s) => s + 1);
  }, [step, formData]);

  const handleBack = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const handleSubmit = useCallback(() => {
    const result = step3Schema.safeParse({ agreed });
    if (!result.success) {
      const flat = z.flattenError(result.error);
      const msg =
        flat.formErrors[0] ??
        (flat.fieldErrors.agreed as string[] | undefined)?.[0] ??
        "Нужно согласие";
      setErrors({ agreed: msg });
      return;
    }
    const order = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "pending" as const,
    };
    addOrder(order);
    router.push("/orders");
  }, [formData, agreed, router]);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const parsed = parsePhoneInput(raw);
      const formatted =
        parsed.length <= 1
          ? raw
          : formatPhoneForDisplay(parsed.length >= 11 ? parsed.slice(0, 11) : parsed);
      updateField("senderPhone", formatted);
    },
    [updateField]
  );

  return (
    <div className="mx-auto w-full max-w-xl">
      <Stepper currentStep={step} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) handleNext();
          else handleSubmit();
        }}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Данные отправителя
            </h2>
            <div>
              <label
                htmlFor="senderName"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Имя
              </label>
              <input
                id="senderName"
                type="text"
                value={formData.senderName}
                onChange={(e) => updateField("senderName", e.target.value.trimStart())}
                className={`w-full rounded-lg border px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                  errors.senderName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                }`}
                placeholder="Иван Иванов"
                autoComplete="name"
                aria-invalid={!!errors.senderName}
                aria-describedby={errors.senderName ? "senderName-error" : undefined}
              />
              {errors.senderName && (
                <p id="senderName-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.senderName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="senderPhone"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Телефон
              </label>
              <input
                id="senderPhone"
                type="tel"
                value={formData.senderPhone}
                onChange={handlePhoneChange}
                className={`w-full rounded-lg border px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                  errors.senderPhone ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                }`}
                placeholder="+7 (999) 123-45-67"
                autoComplete="tel"
                aria-invalid={!!errors.senderPhone}
                aria-describedby={errors.senderPhone ? "senderPhone-error" : undefined}
              />
              {errors.senderPhone && (
                <p id="senderPhone-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.senderPhone}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="senderCity"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Город отправления
              </label>
              <input
                id="senderCity"
                type="text"
                value={formData.senderCity}
                onChange={(e) => updateField("senderCity", e.target.value.trimStart())}
                className={`w-full rounded-lg border px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                  errors.senderCity ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                }`}
                placeholder="Москва"
                autoComplete="address-level2"
                aria-invalid={!!errors.senderCity}
                aria-describedby={errors.senderCity ? "senderCity-error" : undefined}
              />
              {errors.senderCity && (
                <p id="senderCity-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.senderCity}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Получатель и посылка
            </h2>
            <div>
              <label
                htmlFor="recipientName"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Имя получателя
              </label>
              <input
                id="recipientName"
                type="text"
                value={formData.recipientName}
                onChange={(e) => updateField("recipientName", e.target.value.trimStart())}
                className={`w-full rounded-lg border px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                  errors.recipientName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                }`}
                placeholder="Пётр Петров"
                autoComplete="name"
                aria-invalid={!!errors.recipientName}
                aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
              />
              {errors.recipientName && (
                <p id="recipientName-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.recipientName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="recipientCity"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Город назначения
              </label>
              <input
                id="recipientCity"
                type="text"
                value={formData.recipientCity}
                onChange={(e) => updateField("recipientCity", e.target.value.trimStart())}
                className={`w-full rounded-lg border px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                  errors.recipientCity ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                }`}
                placeholder="Санкт-Петербург"
                autoComplete="address-level2"
                aria-invalid={!!errors.recipientCity}
                aria-describedby={errors.recipientCity ? "recipientCity-error" : undefined}
              />
              {errors.recipientCity && (
                <p id="recipientCity-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.recipientCity}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Тип груза
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                {(["documents", "fragile", "regular"] as const).map((type) => (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-2"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        updateField("cargoType", type);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="cargoType"
                      value={type}
                      checked={formData.cargoType === type}
                      onChange={() => updateField("cargoType", type)}
                      className="h-4 w-4 border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {CARGO_LABELS[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="weight"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Вес, кг (0.1–30)
              </label>
              <input
                id="weight"
                type="number"
                step={0.1}
                min={0.1}
                max={30}
                value={formData.weight || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  updateField("weight", v === "" ? 0 : parseFloat(v) || 0);
                }}
                className={`w-full rounded-lg border px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-100 ${
                  errors.weight ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                }`}
                placeholder="5"
                aria-invalid={!!errors.weight}
                aria-describedby={errors.weight ? "weight-error" : undefined}
              />
              {errors.weight && (
                <p id="weight-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.weight}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Подтверждение
            </h2>
            <dl className="grid gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Отправитель
                </dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formData.senderName}, {formData.senderPhone}, {formData.senderCity}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Получатель
                </dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formData.recipientName}, {formData.recipientCity}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Посылка
                </dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {CARGO_LABELS[formData.cargoType]}, {formData.weight} кг
                </dd>
              </div>
            </dl>
            <label
              className="flex cursor-pointer items-start gap-3"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAgreed((a) => !a);
                }
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                aria-invalid={!!errors.agreed}
                aria-describedby={errors.agreed ? "agreed-error" : undefined}
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Согласен с условиями доставки и политикой конфиденциальности
              </span>
            </label>
            {errors.agreed && (
              <p id="agreed-error" className="text-sm text-red-500" role="alert">
                {errors.agreed}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Назад
            </button>
          )}
          <button
            type="submit"
            className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            {step < 3 ? "Далее" : "Отправить"}
          </button>
        </div>
      </form>
    </div>
  );
};
