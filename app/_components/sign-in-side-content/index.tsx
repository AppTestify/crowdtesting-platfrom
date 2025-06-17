"use client";

import {
  RocketIcon,
  SearchIcon,
  LaptopIcon,
  UsersIcon,
  ShieldIcon,
  ShipIcon,
  LayersIcon,
} from "lucide-react";

const roles = [
  {
    icon: <RocketIcon className="text-blue-500 w-4 h-4" />,
    title: "QA Managers",
    description: "Oversee workflows, progress, and quality across the organization.",
  },
  {
    icon: <SearchIcon className="text-blue-500 w-4 h-4" />,
    title: "Test Engineers",
    description: "Create, execute, and automate manual & automated test cases.",
  },
  {
    icon: <LaptopIcon className="text-green-500 w-4 h-4" />,
    title: "DevOps & SDET",
    description: "Integrate testing with CI/CD pipelines and automation systems.",
  },
  {
    icon: <UsersIcon className="text-orange-500 w-4 h-4" />,
    title: "Product Owners",
    description: "Trace requirements, review test coverage, and clear release bottlenecks.",
  },
  {
    icon: <ShieldIcon className="text-purple-500 w-4 h-4" />,
    title: "Security & Compliance",
    description: "Manage permissions, audit trails, and regulatory requirements.",
  },
  {
    icon: <ShipIcon className="text-purple-500 w-4 h-4" />,
    title: "Release Managers",
    description: "Track release readiness and eliminate blockers before shipment.",
  },
  {
    icon: <LayersIcon className="text-blue-600 w-4 h-4" />,
    title: "Business Analysts",
    description: "Map requirements to execution and monitor value delivery.",
  },
];

export default function SignInSideContent() {
  return (
    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-green-50 rounded-xl">
      <h2 className="text-2xl font-semibold text-center mb-6">
        QTM is built for every role in your QA process
      </h2>

      <ul className="space-y-3">
        {roles.map((role, index) => (
          <li
            key={index}
            className="flex items-start gap-4 p-3 rounded-md"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
              {role.icon}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{role.title}</p>
              <p className="text-xs text-gray-600">{role.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
