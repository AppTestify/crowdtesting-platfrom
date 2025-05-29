import { FolderCheck, BadgePercent, Send } from "lucide-react";
import React from "react";

const allSteps = [
  {
    title: "Add Project",
    description:
      "Create a new project workspace. Set key details like title, start and end dates, and a description to kick things off.",
    icon: FolderCheck,
  },
  {
    title: "Pricing",
    description:
      "Define your pricing model and add-ons. Choose how you want to charge clients for your services or features.",
    icon: BadgePercent,
  },
  {
    title: "Invite",
    description:
      "Invite your team members or collaborators. Give them access to contribute and manage the project with you.",
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
