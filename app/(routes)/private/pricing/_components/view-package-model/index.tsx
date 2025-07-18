import { IPackage } from "@/app/_interface/package";
import { getViewPricingService } from "@/app/_services/package.service";
import toasterService from "@/app/_services/toaster-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, Clock, Users, Bug, FileText, CheckCircle, XCircle } from "lucide-react";

export default function ViewPacakgeModel({
  packages,
  sheetOpen,
  setSheetOpen,
}: {
  packages: IPackage | null;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [packageData, setPackageData] = useState<IPackage>();
  const packageId = packages?.id || (packages?._id as string);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const getPackage = async () => {
    try {
      setIsViewLoading(true);
      const data = await getViewPricingService(packageId);

      if (data) {
        setPackageData(data.packageData);
      }
    } catch (error) {
      toasterService.error("Failed to fetch packages.");
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    if (sheetOpen && packageId) {
      getPackage();
    }
  }, [sheetOpen, packageId]);

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge 
        variant={isActive ? "default" : "secondary"}
        className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Balanced Header Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border border-purple-100 mb-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-white/80 border-purple-200 text-purple-700">
                  Package Details
                </Badge>
                {packageData && getStatusBadge(packageData.isActive)}
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                {packageData?.name || "Package Details"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                View comprehensive information about this pricing package
              </DialogDescription>
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          {isViewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading package details...</p>
              </div>
            </div>
          ) : packageData ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem 
                        label="Package Type" 
                        value={packageData.type} 
                        icon={<Package className="h-4 w-4 text-blue-500" />}
                      />
                      <DetailItem 
                        label="Package Name" 
                        value={packageData.name}
                        icon={<Package className="h-4 w-4 text-green-500" />}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pricing Details</h3>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem 
                        label="Amount" 
                        value={`${packageData.currency} ${packageData.amount}`}
                        icon={<DollarSign className="h-4 w-4 text-green-500" />}
                      />
                      <DetailItem 
                        label="Duration" 
                        value={`${packageData.durationHours ?? "N/A"} hours`}
                        icon={<Clock className="h-4 w-4 text-orange-500" />}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Testing Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Testing Configuration</h3>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem 
                        label="Testers" 
                        value={packageData.testers}
                        icon={<Users className="h-4 w-4 text-blue-500" />}
                      />
                      <DetailItem 
                        label="Test Cases" 
                        value={packageData.testCase || "N/A"}
                        icon={<FileText className="h-4 w-4 text-purple-500" />}
                      />
                      <DetailItem 
                        label="Test Execution" 
                        value={packageData.testExecution || "N/A"}
                        icon={<FileText className="h-4 w-4 text-indigo-500" />}
                      />
                      <DetailItem 
                        label="Bugs" 
                        value={packageData.bugs}
                        icon={<Bug className="h-4 w-4 text-red-500" />}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Additional Features</h3>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem 
                        label="More Bugs" 
                        value={packageData.moreBugs ? "Yes" : "No"}
                        icon={packageData.moreBugs ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      />
                      <DetailItem 
                        label="Custom Package" 
                        value={packageData.isCustom ? "Yes" : "No"}
                        icon={packageData.isCustom ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      />
                      <DetailItem 
                        label="Status" 
                        value={packageData.isActive ? "Active" : "Inactive"}
                        icon={getStatusIcon(packageData.isActive)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {packageData.description && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {packageData.description}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No package data found.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      {icon && (
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {value}
        </div>
      </div>
    </div>
  );
}
