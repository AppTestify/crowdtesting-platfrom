"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { truncateString } from "@/app/_constants/truncateString";
import { useState } from "react";

const experienceArray = [
  {
    name: "Project A",
    description:
      "Amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus papariatur quia consectetur quibusdam cupiditate velit quae accusamus illum. Minus vel minima laudantium, fuga iste laborum ipsam officiis nihil recusandae!",
    images: "ImageSchema",
    startDate: new Date("2024-01-10"), // January 10, 2024
    endDate: new Date("2024-03-15"), // March 15, 2024
    id: 1,
  },
  {
    name: "Project B",
    description:
      "Filler text is text that shares some characteristics of a real written text, but is random or otherwise generated. It may be used to display a sample of fonts, generate text for testing, or to spoof an e-mail spam filter.",
    images: "ImageSchema",
    startDate: new Date("2024-05-01"), // May 1, 2024
    endDate: new Date("2024-07-10"), // July 10, 2024
    id: 2,
  },
  {
    name: "Project C",
    description: "This is the third product.",
    images: "ImageSchema",
    startDate: new Date("2024-09-05"), // September 5, 2024
    endDate: new Date("2024-11-20"), // November 20, 2024
    id: 3,
  },
  {
    name: "Project D",
    description: "This is the fourth product.",
    images: "ImageSchema",
    startDate: new Date("2024-02-20"), // February 20, 2024
    endDate: new Date("2024-04-25"), // April 25, 2024
    id: 4,
  },
  {
    name: "Project E",
    description: "This is the fifth product.",
    images: "ImageSchema",
    startDate: new Date("2024-06-15"), // June 15, 2024
    endDate: new Date("2024-08-20"), // August 20, 2024
    id: 5,
  },
  {
    name: "Project F",
    description: "This is the sixth product.",
    images: "ImageSchema",
    startDate: new Date("2024-10-01"), // October 1, 2024
    endDate: new Date("2024-12-31"), // December 31, 2024
    id: 6,
  },
];

const certificateArray = [
  {
    id: 1,
    name: "Certificate in Web Development",
    description:
      "Completed a comprehensive course in web development, covering HTML, CSS, JavaScript, and React.",
    images: [], // Add image objects if applicable
    issuedBy: "Tech Academy",
    issueDate: new Date("2023-08-15"),
    expirationDate: new Date("2025-08-15"),
  },
  {
    id: 2,
    name: "Data Science Professional Certificate",
    description:
      "Acquired skills in data analysis, machine learning, and Python programming.",
    images: [],
    issuedBy: "Data Science Institute",
    issueDate: new Date("2023-09-01"),
    expirationDate: new Date("2026-09-01"),
  },
  {
    id: 3,
    name: "Digital Marketing Certificate",
    description:
      "Mastered digital marketing strategies, including SEO, PPC, and social media marketing.",
    images: [],
    issuedBy: "Marketing Hub",
    issueDate: new Date("2023-10-05"),
    expirationDate: new Date("2026-10-05"),
  },
  {
    id: 4,
    name: "Project Management Certification",
    description:
      "Gained expertise in project management methodologies and best practices.",
    images: [],
    issuedBy: "Project Management Institute",
    issueDate: new Date("2023-11-12"),
    expirationDate: new Date("2025-11-12"),
  },
  {
    id: 5,
    name: "Certified Ethical Hacker",
    description:
      "Certification in ethical hacking and penetration testing techniques.",
    images: [],
    issuedBy: "Cybersecurity Academy",
    issueDate: new Date("2023-12-01"),
    expirationDate: new Date("2026-12-01"),
  },
  {
    id: 6,
    name: "Cloud Computing Certification",
    description:
      "Acquired knowledge in cloud computing technologies and solutions.",
    images: [],
    issuedBy: "Cloud Institute",
    issueDate: new Date("2024-01-10"),
    expirationDate: new Date("2027-01-10"),
  },
];

export default function Certifications() {
  const [certificateSearchTerm, setCertificateSearchTerm] =
    useState<string>("");

  const filteredCertificates = certificateArray.filter((certificate) => {
    const nameMatch = certificate.name
      .toLowerCase()
      .includes(certificateSearchTerm.toLowerCase());
    const descriptionMatch = certificate.description
      .toLowerCase()
      .includes(certificateSearchTerm.toLowerCase());
    const issueDateString = certificate.issueDate.toDateString();
    const expirationDateString = certificate.expirationDate.toDateString();

    const dateMatch =
      issueDateString.includes(certificateSearchTerm) ||
      expirationDateString.includes(certificateSearchTerm) ||
      issueDateString
        .toLowerCase()
        .includes(certificateSearchTerm.toLowerCase()) ||
      expirationDateString
        .toLowerCase()
        .includes(certificateSearchTerm.toLowerCase());

    return nameMatch || descriptionMatch || dateMatch;
  });

  return (
    <>
      <Input
        placeholder="Search Certificates..."
        onChange={(e) => setCertificateSearchTerm(e.target.value)}
        className="ml-auto w-45  mb-1 h-8"
      />
      <Table>
        <TableCaption>
          {filteredCertificates?.length === 0 && "No Certificat found."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead className="w-[500px]">Description</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead className="text-right">Expiration Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCertificates.map((certificate) => (
            <TableRow key={certificate.id}>
              <TableCell className="font-medium">
                {truncateString(certificate.name, 3)}
              </TableCell>
              <TableCell>
                {truncateString(certificate.description, 9)}
              </TableCell>
              <TableCell>{certificate.issueDate.toDateString()}</TableCell>
              <TableCell className="text-right">
                {certificate.expirationDate.toDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
