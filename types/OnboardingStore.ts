export interface OnboardingState {
  step: number | null;
  totalSteps: number;
  hasOnboarded: boolean;
  isLoadingStep: boolean;
  setIsLoadingStep: (val: boolean) => void;

  setStep: (step: number) => void;
  setTotalSteps: (totalSteps: number) => void;

  getUserCurrentStepFromDB: () => Promise<void>;
  checkIfOnboardingCompleted: () => Promise<void>;
  updateUserOnboardingStepInDB: (step: number) => Promise<void>;

  setHasOnboarded: (value: boolean) => void;

  reset: () => void;
}
