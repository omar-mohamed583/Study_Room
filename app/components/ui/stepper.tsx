import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import Button from "./Button";

type Step = {
  id: string;
  title: string;
  content: ReactNode;
};
interface StepperProps {
  stepsArray: Step[];
  validSteps: number[];
  setValidSteps: Dispatch<SetStateAction<number[]>>;
  validationFunction: (name: string) => Promise<boolean>;
}

export default function Stepper({
  stepsArray,
  validSteps,
  setValidSteps,
  validationFunction,
}: StepperProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [disabled, setDisabled] = useState<boolean>(false);

  const titles = stepsArray.map((step) => step.title);

  async function goToNextStep(type: string) {
    const isValid = await validationFunction(type);
    if (isValid) {
      setValidSteps((prev) => [...prev, activeStep]);
      setActiveStep((prev) => prev + 1);
    }
    setDisabled(false);
  }

  return (
    <div className="grid grid-rows-[auto_1fr] gap-12">
      <div className="flex justify-between gap-0.5 sm:gap-2 *:grow-0 self-start">
        {titles.map((title, ind) => {
          const currentStep = ind + 1;
          return (
            <button
              className="flex gap-0.5 sm:gap-2 items-center"
              key={stepsArray[ind].id}
              type="button"
            >
              <span
                className={`grid transition-colors text-gray-300 duration-400 place-content-center text-center rounded-[50%] size-6 sm:size-7 text-sm leading-[normal] shadow-[0_2px_10px_2px_var(--tw-shadow-color)] ${activeStep === currentStep ? "bg-(--accent-200) shadow-blue-400/30" : validSteps.includes(currentStep) ? "bg-emerald-400" : "bg-blue-900"} aspect-square`}
              >
                {currentStep}
              </span>
              <span className="text-xs md:text-[1rem] leading-[normal] text-zinc-300">
                {title}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid w-[75%] mx-auto">
        {stepsArray.map((step, idx) => {
          if (idx + 1 === activeStep) return step.content;
        })}
      </div>
      <div className="flex justify-between *:text-sm *:leading-[normal] md:*:text-[1rem] *:rounded-[6px] *:p-2 *:px-3 *:sm:p-2.5 *:sm:px-3.5">
        {activeStep === 2 && (
          <Button
            disabled={disabled}
            className="bg-zinc-500 hover:brightness-75 transition-[filter] duration-300 flex items-center content-center gap-2"
            type="button"
            onClick={() => {
              setDisabled(true)
              goToNextStep("otp resend");
              setTimeout(() => setDisabled(false), 60000)
            }}
          >
            Resend
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-repeat-2 preview-icon"
            >
              <path d="m2 9 3-3 3 3" />
              <path d="M13 18H7a2 2 0 0 1-2-2V6" />
              <path d="m22 15-3 3-3-3" />
              <path d="M11 6h6a2 2 0 0 1 2 2v10" />
            </svg>
          </Button>
        )}

        <Button
          className="bg-(--accent-100) hover:brightness-75 transition-[filter] duration-300 ms-auto flex items-center content-center gap-2"
          type={"button"}
          disabled={disabled}
          onClick={
            activeStep === 1
              ? () => {
                  setDisabled(true);
                  goToNextStep("email");
                }
              : activeStep === 2
                ? () => goToNextStep("otp verify")
                : () => goToNextStep("password")
          }
        >
          {activeStep === 1
            ? "Send OTP"
            : activeStep === 2
              ? "Verify OTP"
              : "Change Password"}

          {activeStep === 1 && (
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-right preview-icon"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
          {activeStep === 2 && (
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search preview-icon"
            >
              <path d="m21 21-4.34-4.34" />
              <circle
                cx="11"
                cy="11"
                r="8"
              />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
