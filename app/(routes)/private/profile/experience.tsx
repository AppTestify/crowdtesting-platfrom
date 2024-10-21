import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import "@fortawesome/fontawesome-free/css/all.min.css";
import EditExperience from "./editExperience";

const Experience = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productArray = [
    {
      name: "Product A",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus paLorem ipsum dolor sit amet consectetur adipisicing elit. Aut delectus papariatur quia consectetur quibusdam cupiditate velit quae accusamus illum. Minus vel minima laudantium, fuga iste laborum ipsam officiis nihil recusandae!",
      images: "ImageSchema",
      startDate: new Date("2024-01-10"), // January 10, 2024
      endDate: new Date("2024-03-15"), // March 15, 2024
      id: 1,
    },
    {
      name: "Product B",
      description: "This is the second product.",
      images: "ImageSchema",
      startDate: new Date("2024-05-01"), // May 1, 2024
      endDate: new Date("2024-07-10"), // July 10, 2024
      id: 2,
    },
    {
      name: "Product C",
      description: "This is the third product.",
      images: "ImageSchema",
      startDate: new Date("2024-09-05"), // September 5, 2024
      endDate: new Date("2024-11-20"), // November 20, 2024
      id: 3,
    },
    {
      name: "Product D",
      description: "This is the fourth product.",
      images: "ImageSchema",
      startDate: new Date("2024-02-20"), // February 20, 2024
      endDate: new Date("2024-04-25"), // April 25, 2024
      id: 4,
    },
    {
      name: "Product E",
      description: "This is the fifth product.",
      images: "ImageSchema",
      startDate: new Date("2024-06-15"), // June 15, 2024
      endDate: new Date("2024-08-20"), // August 20, 2024
      id: 5,
    },
    {
      name: "Product F",
      description: "This is the sixth product.",
      images: "ImageSchema",
      startDate: new Date("2024-10-01"), // October 1, 2024
      endDate: new Date("2024-12-31"), // December 31, 2024
      id: 6,
    },
  ];

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  return (
    <>
      {productArray?.map((exp, index) => {
        return (
          <div className="col-span-3" key={index}>
            <Card className="w-[350px]  h-[180px]">
              <div className="flex  justify-end">
                <i
                  className="fa-solid fa-pen  cursor-pointer  p-2"
                  onClick={() => handleEdit(exp)}
                ></i>
              </div>
              <CardHeader className="pt-0">
                <CardTitle className="underline">{exp.name}</CardTitle>
                <CardDescription className="h-[30px]">
                  {exp.description.split(" ").slice(0, 12).join(" ")}
                  {exp.description.split(" ").length > 12 ? "..." : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <p>Start Date : {exp.startDate.toDateString()}</p>
              </CardContent>
              <CardFooter className="">
                <p>End Date : {exp.endDate.toDateString()}</p>
              </CardFooter>
            </Card>
          </div>
        );
      })}

      <EditExperience open={open} setOpen={setOpen} product={selectedProduct} />
    </>
  );
};

export default Experience;
