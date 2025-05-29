"use client";

import { useState } from "react";
import Project from "../_components/create-project";
import PricingCards from "../_components/pricing";
import SetupSteps from "../_components/status-bar";
import { InvitePage } from "../_components/invite";
import { OnboardingData } from "@/app/_interface/onboarding";

const CreateProject = () => {
  const [steps, setSteps] = useState<number>(1);

  const [formData, setFormData] = useState<OnboardingData>({
    project: {
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    },
    pricingId: "",
    users: [],
  });
  console.log("FormData", formData);

  return (
    <div className="flex justify-center gap-5 pt-5">
      <SetupSteps step={steps} />
      <div className="overflow-y-scroll no-scrollbar h-[85vh]">
        {steps === 1 ? (
          <Project
            formData={formData}
            setFormData={setFormData}
            setSteps={setSteps}
          />
        ) : steps === 2 ? (
          <PricingCards
            formData={formData}
            setFormData={setFormData}
            setSteps={setSteps}
          />
        ) : steps === 3 ? (
          <InvitePage
            formData={formData}
            setFormData={setFormData}
            setSteps={setSteps}
          />
        ) : null}
      </div>
    </div>
  );
};

export default CreateProject;
