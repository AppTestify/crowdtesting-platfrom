"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Upload, 
    FileSpreadsheet, 
    FileText, 
    Download, 
    CheckCircle, 
    AlertTriangle, 
    Loader2,
    Info,
    X,
    Eye,
    Table,
    FileCheck
} from "lucide-react";
import { useParams } from "next/navigation";
import { importTestCasesService } from "@/app/_services/test-case.service";
import toasterService from "@/app/_services/toaster-service";
import { generateExcelFile } from "@/app/_helpers/generate-excel.helper";

interface ImportTestCasesProps {
    refreshTestCases: () => void;
}

export function ImportTestCases({ refreshTestCases }: ImportTestCasesProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importResults, setImportResults] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { projectId } = useParams<{ projectId: string }>();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv',
                'application/csv'
            ];
            
            if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setSelectedFile(file);
                setImportResults(null);
            } else {
                toasterService.error('Please select a valid Excel or CSV file');
            }
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setProgress(0);
        
        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await importTestCasesService(projectId, selectedFile);
            
            clearInterval(progressInterval);
            setProgress(100);
            
            setImportResults(response.results);
            
            if (response.results.created > 0) {
                toasterService.success(`Successfully imported ${response.results.created} test cases`);
                refreshTestCases();
                setTimeout(() => {
                    setDialogOpen(false);
                    resetForm();
                }, 2000);
            } else {
                toasterService.error('No test cases were imported. Please check your file format.');
            }
        } catch (error) {
            console.error('Import error:', error);
            toasterService.error('Failed to import test cases. Please try again.');
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            'Title',
            'Expected Result',
            'Precondition',
            'Test Type',
            'Severity',
            'Test Suite',
            'Requirements',
            'Test Steps',
            'Test Data'
        ];

        const sampleData = [
            [
                'Login with valid credentials',
                'User should be logged in successfully and redirected to dashboard',
                'User is on login page and has valid account',
                'Manual',
                'High',
                'Authentication Test Suite',
                'REQ001, REQ002',
                '1. Enter valid username in username field | Expected: Username field accepts input\n2. Enter valid password in password field | Expected: Password field accepts input\n3. Click login button | Expected: User is redirected to dashboard',
                '1. Username (Text): testuser\n2. Password (Password): testpass123'
            ],
            [
                'Search functionality with filters',
                'Search results should be filtered correctly based on applied filters',
                'User is on search page with available data',
                'Automated',
                'Medium',
                '', // Empty test suite to show it's optional
                'REQ003',
                '1. Enter search term in search box | Expected: Search box accepts input\n2. Select filter options | Expected: Filter options are selectable\n3. Click search button | Expected: Results are displayed with applied filters',
                '1. Search Term (Text): test product\n2. Category (Dropdown): Electronics\n3. Price Range (Number): 100-500'
            ]
        ];

        generateExcelFile(
            headers,
            sampleData,
            `Test-Cases-Import-Template-${new Date().toISOString().split('T')[0]}.xlsx`
        );
    };

    const resetForm = () => {
        setSelectedFile(null);
        setImportResults(null);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sampleFormat = [
        {
            field: 'Title',
            description: 'Short descriptive title of the test case',
            example: 'Login with valid credentials',
            required: 'Required'
        },
        {
            field: 'Expected Result',
            description: 'What should happen when the test is executed',
            example: 'User should be logged in successfully',
            required: 'Required'
        },
        {
            field: 'Precondition',
            description: 'Prerequisites or conditions before test execution',
            example: 'User is on login page',
            required: 'Optional'
        },
        {
            field: 'Test Type',
            description: 'Type of test (Manual/Automated)',
            example: 'Manual',
            required: 'Required'
        },
        {
            field: 'Severity',
            description: 'Priority level (Low/Medium/High/Critical)',
            example: 'High',
            required: 'Required'
        },
        {
            field: 'Test Suite',
            description: 'Name of the test suite (optional - will be created if not exists)',
            example: 'Authentication Test Suite',
            required: 'Optional'
        },
        {
            field: 'Requirements',
            description: 'Comma-separated requirement IDs',
            example: 'REQ001, REQ002',
            required: 'Optional'
        },
        {
            field: 'Test Steps',
            description: 'Step-by-step test execution (multiple formats supported)',
            example: '1. Enter username | Expected: Field accepts input\n2. Click login | Expected: User logs in',
            required: 'Optional'
        },
        {
            field: 'Test Data',
            description: 'Test data values (multiple formats supported)',
            example: '1. Username (Text): testuser\n2. Password: testpass',
            required: 'Optional'
        }
    ];

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Test Cases
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        Bulk Import Test Cases
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Import multiple test cases from Excel or CSV files. Download the template to see the required format.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload File
                        </TabsTrigger>
                        <TabsTrigger value="format" className="flex items-center gap-2">
                            <Table className="h-4 w-4" />
                            Format Guide
                        </TabsTrigger>
                        <TabsTrigger value="template" className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Template
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6">
                        {/* File Upload */}
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-green-600" />
                                    Upload File
                                </CardTitle>
                                <CardDescription>
                                    Select an Excel (.xlsx, .xls) or CSV file to import
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {selectedFile ? (
                                                <>
                                                    <CheckCircle className="w-8 h-8 mb-4 text-green-500" />
                                                    <p className="mb-2 text-sm text-gray-900 font-medium">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">Excel or CSV files only</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept=".xlsx,.xls,.csv"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {selectedFile && (
                                    <Button
                                        onClick={() => setSelectedFile(null)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Remove File
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress */}
                        {isLoading && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Importing test cases...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Import Results */}
                        {importResults && (
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-purple-600" />
                                        Import Results
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span>Total Records:</span>
                                            <span className="font-medium">{importResults.total}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-green-600">
                                            <span>Successfully Created:</span>
                                            <span className="font-medium">{importResults.created}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-red-600">
                                            <span>Failed:</span>
                                            <span className="font-medium">{importResults.failed}</span>
                                        </div>
                                        
                                        {importResults.errors && importResults.errors.length > 0 && (
                                            <Alert>
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <div className="space-y-1">
                                                        <p className="font-medium">Errors encountered:</p>
                                                        <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                            {importResults.errors.map((error: string, index: number) => (
                                                                <li key={index} className="text-red-600">• {error}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="format" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Table className="h-5 w-5 text-blue-600" />
                                    Excel Format Guide
                                </CardTitle>
                                <CardDescription>
                                    Understanding the required format for importing test cases
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Field</th>
                                                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Description</th>
                                                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Example</th>
                                                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Required</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sampleFormat.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="border border-gray-200 px-4 py-2 font-medium">{item.field}</td>
                                                    <td className="border border-gray-200 px-4 py-2">{item.description}</td>
                                                    <td className="border border-gray-200 px-4 py-2 font-mono text-sm">{item.example}</td>
                                                    <td className="border border-gray-200 px-4 py-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            item.required === 'Required' 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {item.required}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <Alert className="mt-6">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <p className="font-medium">Important Notes:</p>
                                            <ul className="text-sm space-y-1">
                                                <li>• <strong>Test Suite:</strong> Optional - will be auto-created if it doesn't exist</li>
                                                <li>• <strong>Requirements:</strong> Use comma-separated requirement IDs (e.g., "REQ001, REQ002")</li>
                                                <li>• <strong>Test Steps:</strong> Multiple formats supported: "1. Step | Expected: Result" or "1. Step description" (one per line)</li>
                                                <li>• <strong>Test Data:</strong> Multiple formats supported: "1. Field (Type): Value" or "1. Field: Value" (one per line)</li>
                                                <li>• <strong>Test Type:</strong> Use "Manual" or "Automated"</li>
                                                <li>• <strong>Severity:</strong> Use "Low", "Medium", "High", or "Critical"</li>
                                                <li>• <strong>Auto-generated fields:</strong> ID, Created By, Created Date, Updated Date, and Attachments are automatically populated</li>
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="template" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileCheck className="h-5 w-5 text-green-600" />
                                    Download Template
                                </CardTitle>
                                <CardDescription>
                                    Get the Excel template with the correct format and sample data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={downloadTemplate}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Download Excel Template
                                </Button>
                                
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        The template includes only the essential fields needed for import. Auto-generated fields (ID, Created By, Created Date, Updated Date, Attachments) are handled by the system. You can:
                                        <ul className="mt-2 space-y-1 text-sm">
                                            <li>• Replace sample data with your actual test cases</li>
                                            <li>• Add multiple rows for bulk import</li>
                                            <li>• Keep the header row as is</li>
                                            <li>• Save as .xlsx or .csv format</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-end gap-3 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!selectedFile || isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Import Test Cases
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 