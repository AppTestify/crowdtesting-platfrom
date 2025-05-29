"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import toasterService from "@/app/_services/toaster-service";
import { getPackageForClientService } from "@/app/_services/package.service";
import { IPackage } from "@/app/_models/package.model";
import { OnboardingData } from "@/app/_interface/onboarding";

interface PricingCardsProps {
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  formData: OnboardingData;
}

export default function PricingCards({
  setSteps,
  setFormData,
  formData,
}: PricingCardsProps) {
  const [pricingData, setPricingData] = useState<IPackage[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string>(
    formData.pricingId || ""
  );
  useEffect(() => {
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

    getPricing();
  }, []);

  // const onSelect = (plan: IPackage) => {
  //   setSelectedPricing(plan.type);
  //   setFormData((prev) => ({ ...prev, pricingData: plan }));
  // };

  const onSelect = (plan: IPackage) => {
    setSelectedPricing(plan.type);
    setFormData((prev) => ({
      ...prev,
      pricingId: plan.type,
      pricingData: plan,
    }));
  };

  const onSubmit = () => {
    setSteps(3);
  };

  return (
    <div className="py-2 px-4 min-h-[85vh]">
      <div className="w-full max-w-2xl space-y-2">
        <p className="text-sm font-semibold text-green-600 uppercase">
          Step 2 of 3
        </p>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Select Your Pricing
          </h1>
          <p className="mt-2 text-gray-600">
            Select the pricing plan that best fits your needs to continue
            setting up your workspace. You can always upgrade later.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-5">
        <div className="grid gap-5">
          {pricingData.map((plan, index) => (
            <div
              key={index}
              onClick={() => onSelect(plan)}
              className={`relative flex rounded-2xl px-8 py-4 transition-shadow duration-300 cursor-pointer
                ${
                  plan.type === selectedPricing
                    ? "bg-green-100 border-2 border-green-500 shadow-lg"
                    : "bg-white border border-green-200 hover:shadow-xl"
                }`}
            >
              {plan.type === selectedPricing && (
                <div className="absolute -top-3 -left-3 bg-green-500 text-white rounded-full p-1 shadow-md">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="w-52">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {plan.type}
                  </h3>
                  <div className="items-baseline">
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.currency}
                      {plan.amount}
                    </span>
                    <span className="text-gray-500 ml-2 text-sm">
                      /{plan.durationHours} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <Check className="w-2 h-2 text-green-500" />
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    Access for up to {plan.testers} professional testers
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <Check className="w-2 h-2 text-green-500" />
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    Supports {plan.testCase} comprehensive test cases
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <Check className="w-2 h-2 text-green-500" />
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    Up to {plan.testExecution} test executions included
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <Check className="w-2 h-2 text-green-500" />
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    Track and manage up to {plan.bugs} bugs
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-5">
        <Button
          onClick={() => setSteps(1)}
          className="bg-green-600 text-white transition-opacity duration-200"
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!selectedPricing}
          className={`transition-opacity duration-200 ${
            !selectedPricing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save and continue
        </Button>
      </div>
    </div>
  );
}
