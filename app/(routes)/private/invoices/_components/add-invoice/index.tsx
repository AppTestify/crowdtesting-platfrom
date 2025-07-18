"use client";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toasterService from "@/app/_services/toaster-service";
import { Loader2, Upload, FileText, X, CheckCircle } from "lucide-react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "react-responsive";
import { DESKTOP_BREAKPOINT } from "@/app/_constants/media-queries";
import { addInvocieService } from "@/app/_services/invoice.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AddDocumentProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshDocuments: () => void;
}

export default function AddInvoice({
    isOpen,
    setIsOpen,
    refreshDocuments,
}: AddDocumentProps) {
    const isDesktop = useMediaQuery({ query: DESKTOP_BREAKPOINT });

    const [file, setFile] = useState<any>(null);
    const [fileType, setFileType] = useState<string>("");
    const [fileValidationMessage, setValidationMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            if (file.type !== "image/png" && file.type !== "image/jpeg" &&
                file.type !== "application/pdf" && file.type != "application/msword" &&
                file.type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                setFile(null);
                setValidationMessage("Invalid file type. Only PNG, JPEG, PDF, DOC, DOCX formats are accepted.");
                return;
            }

            setFile(file);
            setValidationMessage("");
        } else {
            setFile(null);
            setValidationMessage("Only PNG and JPEG formats are accepted.");
        }
    };

    const handleFileUpdate = async () => {
        try {
            setIsLoading(true);
            if (file) {
                const response = await addInvocieService(file);

                if (response?.message) {
                    toasterService.success(response.message);
                    setIsOpen(false);
                    setIsLoading(false);
                    refreshDocuments();
                }
            }
        } catch (error) {
            toasterService.error();
            setIsOpen(false);
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsLoading(false);
        setValidationMessage("");
        setFileType("");
        setFile(null);
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
                    {/* Balanced Header Design */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100 mb-6">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                        <div className="relative flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                                        New Invoice
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                    Upload Invoice
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 text-sm">
                                    Upload your invoice document for processing and tracking
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-6 pb-6">
                        <div className="space-y-6">
                            {/* File Upload Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
                                </div>
                                
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label
                                                    htmlFor="file-upload"
                                                    className={`text-sm font-medium ${fileValidationMessage ? "text-destructive" : "text-gray-700"}`}
                                                >
                                                    Select Invoice File
                                                </Label>
                                                <div className="mt-2">
                                                    <Input 
                                                        id="file-upload" 
                                                        type="file" 
                                                        onChange={handleFileChange}
                                                        className="h-11"
                                                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                                    />
                                                </div>
                                                {fileValidationMessage ? (
                                                    <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                                                        <X className="h-4 w-4" />
                                                        <span>{fileValidationMessage}</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                            
                                            {file && (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-green-800 truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-green-600">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Supported Formats */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Supported Formats</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['PNG', 'JPEG', 'PDF', 'DOC', 'DOCX'].map((format) => (
                                        <Badge key={format} variant="secondary" className="text-xs">
                                            {format}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!file || isLoading}
                            onClick={() => handleFileUpdate()}
                            className="w-full sm:w-auto h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading Invoice...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Invoice
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="p-0">
                {/* Balanced Header Design */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Upload className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700 text-xs">
                                    New Invoice
                                </Badge>
                            </div>
                            <DrawerTitle className="text-lg font-bold text-gray-900 mb-1">
                                Upload Invoice
                            </DrawerTitle>
                            <DrawerDescription className="text-gray-600 text-sm">
                                Upload your invoice document
                            </DrawerDescription>
                        </div>
                    </div>
                </div>
                
                <div className="px-4 py-6">
                    <div className="space-y-6">
                        {/* File Upload Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900">Document Upload</h3>
                            </div>
                            
                            <Card>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label
                                                htmlFor="file-upload-mobile"
                                                className={`text-sm font-medium ${fileValidationMessage ? "text-destructive" : "text-gray-700"}`}
                                            >
                                                Select Invoice File
                                            </Label>
                                            <div className="mt-2">
                                                <Input 
                                                    id="file-upload-mobile" 
                                                    type="file" 
                                                    onChange={handleFileChange}
                                                    className="h-11"
                                                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                                />
                                            </div>
                                            {fileValidationMessage ? (
                                                <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                                                    <X className="h-4 w-4" />
                                                    <span>{fileValidationMessage}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                        
                                        {file && (
                                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-green-800 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Supported Formats */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Supported Formats</h4>
                            <div className="flex flex-wrap gap-2">
                                {['PNG', 'JPEG', 'PDF', 'DOC', 'DOCX'].map((format) => (
                                    <Badge key={format} variant="secondary" className="text-xs">
                                        {format}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-4 border-t">
                    <Button
                        className="w-full h-11"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-full h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={!file || isLoading}
                        onClick={() => handleFileUpdate()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </>
                        )}
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
