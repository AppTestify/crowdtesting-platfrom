"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IPackage } from "@/app/_interface/package";
import { useState } from "react";

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
  const [showFeaturesFor, setShowFeaturesFor] = useState<string | null>(null);

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

  const getFeatureList = (plan: IPackage): string[] => {
    if (plan.type === "free") {
      return [
        `Up to ${plan.testers} Users`,
        "1 Project",
        `${plan.testCase} Test Cases`,
        "5 Test Cycles",
        "Requirements, Test Plans, Test Suites, Executions",
        "Issues & Tasks Tracking",
        "Basic RTM & Reports",
        "Community Support",
      ];
    }

    if (plan.type === "premium") {
      return [
        `Up to ${plan.testers} Users`,
        "5 Projects",
        `${plan.testCase} Test Cases`,
        "50 Test Cycles",
        "All Starter Features",
        "Custom Issue Types & Severities",
        "Device-wise & Severity-wise Reporting",
        "Task Management & Assignment",
        "RTM with Traceability Matrix",
        "Email Support",
      ];
    }

    if (plan.type === "enterprises") {
      return [
        "Unlimited Users",
        "Unlimited Projects",
        "Unlimited Test Cases & Cycles",
        "All Professional Features",
        "Advanced Reports & Dashboards",
        "SLA-based Issue Management",
        "Custom Workflows & Permissions",
        "Single Sign-On (SSO)",
        "Dedicated Account Manager",
        "Priority Support",
      ];
    }

    return [];
  };

  const order: Record<string, number> = {
    free: 0,
    premium: 1,
    enterprise: 2,
  };

  const sortedPricingData = [...pricingData].sort((a, b) => {
    const aType = a.type?.toLowerCase() || "";
    const bType = b.type?.toLowerCase() || "";

    return (order[aType] ?? 99) - (order[bType] ?? 99);
  });

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium mb-2">
          Step 2 of 3
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
          Choose Your Perfect Plan
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
          Select the pricing plan that best fits your team size and testing needs. You can always upgrade or change your plan later as your team grows.
        </p>
      </div>

      {/* Enhanced Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {sortedPricingData.map((plan, index) => {
          const isSelected = plan._id === selectedPricing;
          const features = getFeatureList(plan);
          const maxFeatures = 5;
          const showPopover = features.length > maxFeatures;

          return (
            <Card
              key={plan._id || index}
              onClick={() => onSelect(plan)}
              className={`flex flex-col h-auto min-h-[340px] max-h-[420px] relative cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                isSelected
                  ? "ring-2 ring-green-500 shadow-2xl transform -translate-y-2 scale-105 z-30"
                  : "hover:ring-1 hover:ring-green-200"
              } bg-gradient-to-br from-white/90 via-blue-50 to-green-50 backdrop-blur-md border border-white/30 text-gray-900 rounded-2xl overflow-visible group`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-xl tracking-wide border-2 border-white/40">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg z-40 border-2 border-white/40 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <CardContent className="flex flex-col flex-grow p-6 md:p-5">
                {/* Plan Header */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow-sm">
                    <span className="text-lg font-bold text-green-600 capitalize">
                      {plan.type.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-gray-700">
                    {plan.type}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-baseline mb-3">
                  {plan.type === "enterprises" ? (
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        Contact Us
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Custom pricing for your team
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.currency}{plan.amount}
                      </span>
                      <span className="ml-2 text-gray-500 font-medium text-xs">
                        {plan.type === "premium" ? "/user/mo" : "/mo"}
                      </span>
                    </>
                  )}
                </div>

                {/* Features (compact) */}
                <div className="space-y-2 mb-4 flex-grow">
                  {features.slice(0, maxFeatures).map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start space-x-2"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      </div>
                      <span className="text-xs leading-snug text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {showPopover && (
                    <button
                      type="button"
                      className="mt-1 text-xs text-blue-600 font-semibold cursor-pointer underline underline-offset-2 group-hover:text-blue-800 transition-colors duration-200 bg-transparent border-0 p-0 focus:outline-none"
                      onClick={e => { e.stopPropagation(); setShowFeaturesFor(plan._id); }}
                    >
                      +{features.length - maxFeatures} more
                    </button>
                  )}
                  {/* Popover/Modal for all features */}
                  {showFeaturesFor === plan._id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowFeaturesFor(null)}>
                      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full relative" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowFeaturesFor(null)}>&times;</button>
                        <h4 className="text-lg font-bold mb-3 text-gray-900">All Features</h4>
                        <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="mt-0.5"><Check className="w-3 h-3 text-green-600" /></span>
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enterprise Contact Info */}
                {plan.type === "enterprises" && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-800">
                      <span className="font-semibold">Get in touch: </span>
                      <a
                        href="mailto:contact@apptestify.com"
                        className="text-green-600 hover:text-green-700 underline font-medium"
                      >
                        contact@apptestify.com
                      </a>
                    </p>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  className={`w-full py-2 font-bold text-sm rounded-xl mt-2 transition-all duration-300 transform hover:scale-105 shadow-md ${
                    isSelected
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  onClick={() => onSelect(plan)}
                >
                  {isSelected ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Selected</span>
                    </div>
                  ) : (
                    `Choose ${plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-500">
            Need help choosing? Our team can help you find the right plan.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={() => setSteps(1)}
            variant="outline"
            className="px-8 py-3 font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedPricing}
            className={`px-8 py-3 font-bold transition-all duration-200 ${
              !selectedPricing
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            Continue to Team Setup
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
} 