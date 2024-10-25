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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { truncateString } from "@/app/_constants/truncateString";
import { useState } from "react";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu-icon";

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

export default function PastProjects() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredExperiences = experienceArray.filter((experience) => {
    const nameMatch = experience.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descriptionMatch = experience.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const startDateString = experience.startDate.toDateString();
    const endDateString = experience.endDate.toDateString();

    const dateMatch =
      startDateString.includes(searchTerm) ||
      endDateString.includes(searchTerm) ||
      startDateString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endDateString.toLowerCase().includes(searchTerm.toLowerCase());

    return nameMatch || descriptionMatch || dateMatch;
  });

  const deletePastProject = () => {
    console.log("Delete");
  };
  const viewPastProject = () => {
    console.log("view");
  };
  const editPastProject = () => {
    console.log("Delete");
  };
  return (
    <>
      <Input
        placeholder="Search Project..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="ml-auto w-45  mb-1 h-8"
      />
      <Table>
        <TableCaption>
          {filteredExperiences?.length === 0
            ? "No Project found"
            : "list of All your Projects."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Name</TableHead>
            <TableHead className="w-[500px]">Description</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">End Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExperiences.map((experience) => (
            <TableRow key={experience.id}>
              <TableCell className="font-medium">{experience.name}</TableCell>
              <TableCell>
                {truncateString(experience.description, 10)}
              </TableCell>
              <TableCell>{experience.startDate.toDateString()}</TableCell>
              <TableCell className="text-right">
                {experience.endDate.toDateString()}
              </TableCell>
              <TableCell className="flex justify-center items-center  ml-3">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Icons.VerticalDotsIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={viewPastProject}>
                      {" "}
                     View <Icons.ViewIcon />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={editPastProject}>
                      {" "}
                      <Icons.EditIcon />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={deletePastProject}>
                      {" "}
                      <Icons.DeleteIcon />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
