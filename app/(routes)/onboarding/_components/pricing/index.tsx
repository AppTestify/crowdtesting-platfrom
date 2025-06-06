"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IPackage } from "@/app/_interface/package";

interface PricingCardsProps {
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  formData: any;
  pricingData: IPackage[];
  selectedPricing: string;
  setSelectedPricing: React.Dispatch<React.SetStateAction<string>>;
}

export default function PricingCards({
  setSteps,
  setFormData,
  formData,
  pricingData,
  selectedPricing,
  setSelectedPricing,
}: PricingCardsProps) {
  const onSelect = (plan: IPackage) => {
    const id = plan._id ?? "";
    setSelectedPricing(id);
    setFormData((prev: any) => ({
      ...prev,
      pricingId: id,
    }));
  };

  const onSubmit = () => {
    setSteps(3);
  };

  const getFeatureList = (plan: IPackage) => {
    const defaultFeatures = [
      `Up to ${plan.testers} Users`,
      `${plan.testCase} test cases`,
      // "Basic Dashboard, Requirements, Test Plans, Suites",
      `Limited ${plan.testExecution} Test Executions`,
      "Basic Issues & Tasks",
      "Limited Reports (summary only)",
      "Community support",
    ];

    return plan.features && plan.features.length > 0
      ? plan.features
      : defaultFeatures;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6  lg:px-10 xl:px-10 2xl:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1 pt-3">
            Step 2 of 3
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Choose Your Plan
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Select the pricing plan that best fits your needs to continue
            setting up your workspace. You can always upgrade later.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 p-3 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {pricingData?.map((plan, index) => {
            const isSelected = plan._id === selectedPricing;

            return (
              <Card
                key={plan._id || index}
                onClick={() => onSelect(plan)}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isSelected
                    ? "ring-2 ring-green-500 shadow-2xl transform -translate-y-1"
                    : "hover:ring-1 hover:ring-green-200"
                } bg-white border border-gray-200 text-gray-900`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-200 to-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <CardContent className="p-6 sm:p-8">
                  {/* Plan Type */}
                  <div className="mb-3">
                    <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide mb-4 text-gray-500">
                      {plan.type}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {plan.currency}
                        {plan.amount}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        /{plan.durationHours} months
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {getFeatureList(plan).map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-5 h-5 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                        </div>
                        <span className="text-sm leading-relaxed text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full py-2 sm:py-3 px-2 font-semibold text-sm sm:text-base transition-all duration-200 ${
                      isSelected
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                    onClick={() => onSelect(plan)}
                  >
                    {isSelected
                      ? "Selected"
                      : `${
                          plan.type.charAt(0).toUpperCase() + plan.type.slice(1)
                        }`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-6xl mx-auto px-4">
          <Button
            onClick={() => setSteps(1)}
            variant="outline"
            className="px-8 py-3 font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
          >
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedPricing}
            className={`px-8 py-3 font-semibold w-full sm:w-auto transition-all duration-200 ${
              !selectedPricing
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            Save and Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
