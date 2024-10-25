import { Button } from "@/components/ui/button";
import React from "react";

const AboutMe = () => {
  return (
    <div className="p-8 pt-0">
      <div className=" w-[1018px] flex justify-between items-center mb-2 ">
        <label className="text-sm">
          No Info Found ! , Please Update about yourself{" "}
        </label>
        <Button className="h-6 text-xs">{"Update"}</Button>
      </div>

      <div className="w-[1019px] h-[280px] justify-between   mt-3">
        After updated message 
      </div>
    </div>
  );
};

export default AboutMe;
