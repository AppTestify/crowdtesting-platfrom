import { FolderCheck, BadgePercent, Send } from "lucide-react";
import React from "react";

const allSteps = [
  {
    title: "Add Project",
    icon: FolderCheck,
  },
  {
    title: "Pricing",
    icon: BadgePercent,
  },
  {
    title: "Invite",
    icon: Send,
  },
];

export default function MobileStatusBar({ step }: { step: number }) {
  return (
    <div className="bg-green-50 p-2 shadow">
      <div className="flex items-center justify-between relative">
        {allSteps.map((item, index) => {
          const isActive = index === step - 1;
          const isCompleted = index < step - 1;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative w-full"
            >
              {/* Connector line */}
              {index !== 0 && (
                <div className="absolute -left-1/2 top-4 w-full h-0.5 bg-gray-300 z-0">
                  <div
                    className={`h-full ${
                      isCompleted ? "bg-green-600" : ""
                    } transition-all duration-500`}
                  />
                </div>
              )}

              {/* Step icon */}
              <div
                className={`z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
                  isActive
                    ? "bg-green-600"
                    : isCompleted
                    ? "bg-green-300"
                    : "bg-gray-100"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${
                    isActive || isCompleted ? "text-white" : "text-black"
                  }`}
                />
              </div>

              {/* Step title */}
              <span className="text-[10px] sm:text-xs mt-1 text-center text-gray-800">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
