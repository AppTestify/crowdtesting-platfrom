import { FolderCheck, BadgePercent, Send } from "lucide-react";
import React from "react";

const allSteps = [
  {
    title: "Create Your Project",
    description: "Set up your first testing project with basic details and goals.",
    icon: FolderCheck,
  },
  {
    title: "Choose Your Plan",
    description: "Pick the perfect plan that fits your team size and budget.",
    icon: BadgePercent,
  },
  {
    title: "Invite Your Team",
    description: "Add team members to collaborate and start testing together.",
    icon: Send,
  },
];

export default function SetupSteps({ step }: { step: number }) {
  return (
    <div className="w-full max-w-md bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
          Quick Setup
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          3 Easy Steps
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Get started in minutes with our simple setup process.
        </p>
      </div>

      {/* Steps */}
      <div role="list" className="relative space-y-6">
        {allSteps.map((item, index) => {
          const isActive = index === step - 1;
          const isCompleted = index < step - 1;

          return (
            <div
              key={index}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              className="flex items-start space-x-4 transform transition-all duration-500"
            >


              {/* Icon Container */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 transform ${
                    isActive 
                      ? "bg-green-600 shadow-lg shadow-green-600/25 scale-110" 
                      : isCompleted
                      ? "bg-green-500 shadow-md"
                      : "bg-gray-100 border-2 border-gray-200"
                  } ${isActive ? "ring-4 ring-green-600/20" : ""}`}
                >
                  <item.icon
                    className={`w-6 h-6 transition-all duration-500 ${
                      isActive || isCompleted ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className={`transition-all duration-500 ${
                  isActive ? "transform translate-x-1" : ""
                }`}>
                  <h3 className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                    isActive 
                      ? "text-green-700" 
                      : isCompleted 
                      ? "text-gray-900" 
                      : "text-gray-500"
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                    isActive 
                      ? "text-gray-700" 
                      : isCompleted 
                      ? "text-gray-600" 
                      : "text-gray-400"
                  }`}>
                    {item.description}
                  </p>
                  
                  {/* Progress indicator */}
                  {isActive && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="mt-2 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">Done</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simplified Progress Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">{step}/3</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(step / allSteps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {step === 1 && "Let's create your project"}
          {step === 2 && "Choose what works for you"}
          {step === 3 && "Almost there! Add your team"}
        </p>
      </div>
    </div>
  );
}
