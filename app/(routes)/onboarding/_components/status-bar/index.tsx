import { FolderCheck, BadgePercent, Send } from "lucide-react";
import React from "react";

const allSteps = [
  {
    title: "Project Setup Made Easy",
    description:
      "Kickstart your testing journey by creating your first project. This helps QTM structure your requirements, test cases, executions, and reports in one place.",
    icon: FolderCheck,
  },
  {
    title: "Choose the Plan That Fits Your Team Size and Needs",
    description:
      "Select the right subscription model before proceeding to manage your projects.",
    icon: BadgePercent,
  },
  {
    title: "Collaborate Better. Involve Your Entire QA, Development, and Product Teams.",
    description:
      "Set up your team so you can assign tasks, review progress, and collaborate effectively.",
    icon: Send,
  },
];

export default function SetupSteps({ step }: { step: number }) {
  return (
    <div className="max-w-md bg-green-50 p-6 rounded-xl shadow">
      <p className="text-sm text-gray-600 mb-6">
        <span className="font-medium">Get started</span> by setting up your
        project and company email.
      </p>

      <div role="list" className="relative space-y-16">
        {allSteps.map((item, index) => {
          const isActive = index === step - 1;

          return (
            <div
              key={index}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              className="flex items-start space-x-4 transform transition-all duration-500"
            >
              <div className="flex flex-col items-center relative">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full p-2 transition-colors duration-300 ${
                    isActive ? "bg-green-600" : "bg-gray-100"
                  } z-10`}
                >
                  <item.icon
                    className={`w-8 h-8 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-black"
                    }`}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
