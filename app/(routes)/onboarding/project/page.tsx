"use client";

import { useEffect, useState } from "react";
import Project from "../_components/create-project";
import PricingCards from "../_components/pricing";
import SetupSteps from "../_components/status-bar";
import { InvitePage } from "../_components/invite";
import { OnboardingData } from "@/app/_interface/onboarding";
import { addOnboardingService } from "@/app/_services/onboarding.service";
import { getPackageForClientService } from "@/app/_services/package.service";
import { IPackage } from "@/app/_interface/package";
import toasterService from "@/app/_services/toaster-service";
import { useRouter } from "next/navigation";
import MobileStatusBar from "../_components/mobile-status-bar";

const CreateProject = () => {
  const [steps, setSteps] = useState<number>(1);
  const [pricingData, setPricingData] = useState<IPackage[]>([]);
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

  const [selectedPricing, setSelectedPricing] = useState<string>(
    formData.pricingId || ""
  );
  const [testers, setTesters] = useState<number>(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleResize = () => setIsMobile(mediaQuery.matches);

    // Initial check
    handleResize();

    // Listen for screen size changes
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  useEffect(() => {
    if (selectedPricing && pricingData.length > 0) {
      const selectedPackage = pricingData.find(
        (data) => data._id === selectedPricing
      );
      if (selectedPackage) {
        const testers = selectedPackage.testers;
        setTesters(testers);
        // console.log("Numbers of Tester", testers);
      }
    }
  }, [selectedPricing]);

  const router = useRouter();

  const addOnboarding = async () => {
    try {
      await addOnboardingService(formData);
      toasterService.success("Project created successfully");
      router.push("/private/dashboard");
    } catch (error) {
      toasterService.error("Project not created");
    }
  };

  // console.log("FormData", formData);

  const getPricing = async () => {
    try {
      const { packages } = await getPackageForClientService();
      if (packages) {
        setPricingData(packages);
      }
    } catch (error) {
      toasterService.error("Failed to fetch pricing data");
    }
  };

  useEffect(() => {
    getPricing();
  }, []);

  return (
    <div className="flex justify-center mt-2 md:px-8 lg:px-10 w-full ">
      {/* Always show SetupSteps except on mobile */}
      {!isMobile && <SetupSteps step={steps} />}

      <div className="overflow-y-scroll no-scrollbar h-[85vh] w-full">
        {isMobile && (
          <MobileStatusBar step={steps}/>
        ) }
        
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
            pricingData={pricingData}
            selectedPricing={selectedPricing}
            setSelectedPricing={setSelectedPricing}
          />
        ) : steps === 3 ? (
          <InvitePage
            formData={formData}
            setFormData={setFormData}
            setSteps={setSteps}
            addOnboarding={addOnboarding}
            testers={testers}
          />
        ) : null}
      </div>
    </div>
  );
};

export default CreateProject;
