import { useState } from "react";
import { Check } from "lucide-react";
import { SignupEmailStep } from "./steps/SignupEmailStep";
import { SignupCodeStep } from "./steps/SignupCodeStep";
import { SignupProfileStep } from "./steps/SignupProfileStep";
import { cn } from "../../../lib/utils";

type Step = "identify" | "verify" | "profile" | "done";

const STEP_ORDER: Step[] = ["identify", "verify", "profile"];
const STEP_LABELS: Record<Step, string> = {
  identify: "Contact",
  verify: "Verify",
  profile: "Profile",
  done: "Done",
};

interface SignupWizardProps {
  onComplete: () => void;
}

export function SignupWizard({ onComplete }: SignupWizardProps) {
  const [step, setStep] = useState<Step>("identify");
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const currentIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {STEP_ORDER.map((s, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isComplete && "bg-ember-400 text-ink-950",
                  isCurrent && "bg-ink-900 text-paper-50 dark:bg-ember-400 dark:text-ink-950",
                  !isComplete && !isCurrent && "bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300",
                )}
              >
                {isComplete ? <Check size={13} /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent ? "text-ink-950 dark:text-paper-50" : "text-ink-500 dark:text-ink-300",
                )}
              >
                {STEP_LABELS[s]}
              </span>
              {index < STEP_ORDER.length - 1 && (
                <div className="h-px flex-1 bg-paper-200 dark:bg-ink-800" />
              )}
            </div>
          );
        })}
      </div>

      {step === "identify" && (
        <SignupEmailStep
          onSuccess={(value) => {
            setEmailOrPhone(value);
            setStep("verify");
          }}
        />
      )}

      {step === "verify" && (
        <SignupCodeStep
          emailOrPhone={emailOrPhone}
          onSuccess={() => setStep("profile")}
          onBack={() => setStep("identify")}
        />
      )}

      {step === "profile" && (
        <SignupProfileStep
          onSuccess={() => {
            setStep("done");
            onComplete();
          }}
        />
      )}
    </div>
  );
}