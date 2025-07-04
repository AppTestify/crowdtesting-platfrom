import { FolderCheck, BadgePercent, Send } from "lucide-react";
import React from "react";

const allSteps = [
  {
    title: "Create Project",
    icon: FolderCheck,
  },
  {
    title: "Choose Plan",
    icon: BadgePercent,
  },
  {
    title: "Add Team",
    icon: Send,
  },
];

export default function MobileStatusBar({ step }: { step: number }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 shadow-lg">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Quick Setup</h3>
          <p className="text-sm text-gray-600">Step {step} of {allSteps.length}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">
            {Math.round((step / allSteps.length) * 100)}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between relative mb-4">
        {/* Progress line background */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200"></div>
        
        {/* Active progress line */}
        <div 
          className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700 ease-out"
          style={{ width: `calc(${((step - 1) / (allSteps.length - 1)) * 100}% - 0px)` }}
        ></div>

        {allSteps.map((item, index) => {
          const isActive = index === step - 1;
          const isCompleted = index < step - 1;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              {/* Step icon */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 transform ${
                  isActive
                    ? "bg-green-600 shadow-lg shadow-green-600/25 scale-110"
                    : isCompleted
                    ? "bg-green-500 shadow-md"
                    : "bg-white border-2 border-gray-300"
                } ${isActive ? "ring-4 ring-green-600/20" : ""}`}
              >
                <item.icon
                  className={`w-4 h-4 transition-all duration-500 ${
                    isActive || isCompleted ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>

              {/* Step title */}
              <span className={`text-xs mt-2 text-center font-medium transition-colors duration-300 ${
                isActive 
                  ? "text-green-700" 
                  : isCompleted 
                  ? "text-gray-900" 
                  : "text-gray-500"
              }`}>
                {item.title}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="mt-1 flex space-x-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1 h-1 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              {React.createElement(allSteps[step - 1].icon, { 
                className: "w-3 h-3 text-green-600" 
              })}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              {allSteps[step - 1].title}
            </h4>
            <p className="text-xs text-green-700 leading-relaxed">
              {step === 1 && "Set up your testing project with basic details."}
              {step === 2 && "Pick a plan that fits your team and budget."}
              {step === 3 && "Invite team members to start collaborating."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
