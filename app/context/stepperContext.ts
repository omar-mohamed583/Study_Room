import { createContext, useContext } from "react";

export type Step = {
  title: string;
  id: string;
  content: React.JSX.Element;
};

export type StepperContextType = {
  stepsArray: Step[];
  activeStep: number;
  loading: boolean;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  validSteps: Set<number>;
};

export const StepperContext = createContext<StepperContextType | null>(null)

export default function useStepper() {
  const context = useContext(StepperContext);

  if (!context) throw new Error("No Context");

  return context;
}