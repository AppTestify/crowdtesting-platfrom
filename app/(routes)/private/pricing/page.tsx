"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { AddPricing } from "./_components/add-pricing";
import PricingModel from "./_components/pricing-model";
import AddOn from "./_components/add-on";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddOnForm } from "./_components/add-on-form";

export default function Pricing() {
  const [activeTab, setActiveTab] = useState("pricing");

  return (
    <div className="mx-4 mt-4">
      <div className="">
        <h2 className="font-medium text-xl text-primary my-5">Pricing Model</h2>
      </div>
      <div className="w-full">
        <div className=" flex justify-between">
          <div className="w-1/2">
            <Input className="w-full" placeholder="Filter pricing" />
          </div>
          <div>{activeTab === "pricing" ? <AddPricing /> : <AddOnForm />}</div>
        </div>

        <div className="mt-2 mb-3">
          <Tabs
            defaultValue="pricing"
            value={activeTab}
            onValueChange={(val) => setActiveTab(val)}
          >
            <TabsList className="grid w-full md:w-1/2 grid-cols-2">
              <TabsTrigger value="pricing">Pricing Model</TabsTrigger>
              <TabsTrigger value="addon">Add On</TabsTrigger>
            </TabsList>
            <TabsContent value="pricing">
              <PricingModel />
            </TabsContent>
            <TabsContent value="addon">
              <AddOn />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
