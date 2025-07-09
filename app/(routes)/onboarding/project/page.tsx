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

  const [selectedPricing, setSelectedPricing] = useState<string>("");
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
      }
    }
  }, [selectedPricing]);

  // Sync selectedPricing with formData.pricingId
  useEffect(() => {
    if (formData.pricingId && formData.pricingId !== selectedPricing) {
      setSelectedPricing(formData.pricingId);
    }
  }, [formData.pricingId, selectedPricing]);

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
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      {/* Desktop Status Bar - Left Sidebar */}
      {!isMobile && (
        <div className="lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-24">
            <SetupSteps step={steps} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {/* Mobile Status Bar */}
        {isMobile && (
          <div className="mb-6">
            <MobileStatusBar step={steps} />
          </div>
        )}

        {/* Content with smooth transitions */}
        <div className="relative">
          <div 
            className={`transition-all duration-500 ease-in-out ${
              steps === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {steps === 1 && (
              <Project
                formData={formData}
                setFormData={setFormData}
                setSteps={setSteps}
              />
            )}
          </div>

          <div 
            className={`transition-all duration-500 ease-in-out ${
              steps === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {steps === 2 && (
              <PricingCards
                formData={formData}
                setFormData={setFormData}
                setSteps={setSteps}
                pricingData={pricingData}
                selectedPricing={selectedPricing}
                setSelectedPricing={setSelectedPricing}
              />
            )}
          </div>

          <div 
            className={`transition-all duration-500 ease-in-out ${
              steps === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {steps === 3 && (
              <InvitePage
                formData={formData}
                setFormData={setFormData}
                setSteps={setSteps}
                addOnboarding={addOnboarding}
                testers={testers}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
