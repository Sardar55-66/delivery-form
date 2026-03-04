"use client";

const STEPS = ["Отправитель", "Получатель и посылка", "Подтверждение"];

interface StepperProps {
  currentStep: number;
}

export const Stepper = ({ currentStep }: StepperProps) => {
  return (
    <nav aria-label="Прогресс формы" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          return (
            <li
              key={label}
              className="flex flex-1 items-center last:flex-none"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isActive
                        ? "border-2 border-emerald-600 bg-white text-emerald-600"
                        : "border-2 border-zinc-300 bg-white text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
                  }`}
                  aria-hidden
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <span
                  className={`mt-2 hidden text-xs font-medium sm:block ${
                    isActive ? "text-emerald-600" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 sm:mx-4 ${
                    isCompleted ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
