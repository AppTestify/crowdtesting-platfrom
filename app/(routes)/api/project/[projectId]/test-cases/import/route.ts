import { NextRequest, NextResponse } from "next/server";
import { TestCase } from "@/app/_models/test-case.model";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestSuite } from "@/app/_models/test-suite.model";
import { Requirement } from "@/app/_models/requirement.model";
import { User } from "@/app/_models/user.model";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { verifySession } from "@/app/_lib/dal";
import { connectDatabase } from "@/app/_db";
import { errorHandler } from "@/app/_utils/error-handler";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { IdFormat } from "@/app/_models/id-format.model";
import { DBModels } from "@/app/_constants";
import { customIdForSearch } from "@/app/_utils/common-server-side";
import * as XLSX from "xlsx";

export async function POST(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await verifySession();
        if (!session.isAuth) {
            return NextResponse.json(
                { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        const isDBConnected = await connectDatabase();
        if (!isDBConnected) {
            return NextResponse.json(
                {
                    message: DB_CONNECTION_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { message: "No file provided" },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        // Read the file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row
        const rows = data.slice(1) as any[][];

        const results = {
            total: rows.length,
            created: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Get test suites and requirements for mapping
        const testSuites = await TestSuite.find({ projectId: params.projectId }).lean();
        const requirements = await Requirement.find({ projectId: params.projectId }).lean();
        
        // Get requirement ID format to understand the display format
        const requirementIdFormat = await IdFormat.findOne({ entity: DBModels.REQUIREMENT });
        
        console.log('Import Debug - Requirement ID Format:', requirementIdFormat?.idFormat);
        console.log('Import Debug - Available Requirements:', requirements.map(r => ({ id: r._id, customId: r.customId, title: r.title })));

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                // Map CSV/Excel columns to data (new format order)
                const [
                    precondition, title, stepsText, testDataText, expectedResult,
                    severity, testType, testSuiteName, requirementsList
                ] = row;

                // Find test suite by name or create if not exists
                let testSuite;
                if (testSuiteName) {
                    testSuite = testSuites.find(ts => ts.title === testSuiteName);
                    if (!testSuite) {
                        // Create new test suite if it doesn't exist
                        const newTestSuite = new TestSuite({
                            title: testSuiteName,
                            description: `Auto-created test suite for imported test cases`,
                            projectId: params.projectId,
                            userId: session.user?._id || session.user?.id
                        });
                        testSuite = await newTestSuite.save();
                    }
                }

                // Find requirements by custom IDs
                const requirementIds = requirementsList ? 
                    requirementsList.split(',').map((reqId: string) => reqId.trim()) : [];
                
                // Convert display format (REQ1, REQ2) to numeric customId (1, 2)
                const numericRequirementIds = requirementIds.map((reqId: string) => {
                    // Remove the prefix (REQ) to get the numeric part
                    const numericId = customIdForSearch(requirementIdFormat, reqId);
                    return numericId;
                });
                
                console.log('Import Debug - Original Requirement IDs:', requirementIds);
                console.log('Import Debug - Numeric Requirement IDs:', numericRequirementIds);
                
                const foundRequirements = requirements.filter(req => {
                    const reqCustomId = req.customId.toString();
                    return numericRequirementIds.includes(reqCustomId) || 
                           numericRequirementIds.includes(parseInt(reqCustomId).toString());
                });

                // Also try to find by ID if customId doesn't work
                if (foundRequirements.length === 0 && requirementIds.length > 0) {
                    const foundById = requirements.filter(req => 
                        requirementIds.includes((req._id as any).toString())
                    );
                    if (foundById.length > 0) {
                        foundRequirements.push(...foundById);
                    }
                }

                console.log('Import Debug - Requirements List:', requirementsList);
                console.log('Import Debug - Requirement IDs:', requirementIds);
                console.log('Import Debug - Found Requirements:', foundRequirements.map(r => ({ id: r._id, customId: r.customId, title: r.title })));
                console.log('Import Debug - All Available Requirements for Comparison:', requirements.map(r => ({ id: r._id, customId: r.customId, title: r.title })));

                // Create test case (auto-generated fields)
                const testCaseData = {
                    title: title || '',
                    expectedResult: expectedResult || '',
                    precondition: precondition || '',
                    testType: testType || 'Manual',
                    severity: severity || 'Low',
                    projectId: params.projectId,
                    testSuite: testSuite?._id, // Optional test suite
                    requirements: foundRequirements.map(req => req._id),
                    userId: session.user?._id || session.user?.id,
                    attachments: []
                };

                console.log('Import Debug - Test Case Data:', testCaseData);

                const testCase = new TestCase(testCaseData);
                console.log('Import Debug - Test Case Requirements:', testCase.requirements);

                const savedTestCase = await testCase.save();
                console.log('Import Debug - Saved Test Case Requirements:', savedTestCase.requirements);

                // Create test steps if provided
                if (stepsText) {
                    const steps = stepsText.split('\n').filter((step: string) => step.trim());
                    let stepOrder = 0;
                    
                    for (let j = 0; j < steps.length; j++) {
                        const stepText = steps[j].trim();
                        
                        // Try multiple regex patterns for flexibility
                        let stepMatch = stepText.match(/^\d+\.\s*(.+?)\s*\|\s*Expected:\s*(.+)$/);
                        
                        if (!stepMatch) {
                            // Try alternative format: "1. Step description | Expected: Expected result"
                            stepMatch = stepText.match(/^\d+\.\s*(.+?)\s*\|\s*Expected:\s*(.+)$/i);
                        }
                        
                        if (!stepMatch) {
                            // Try format without "Expected:" keyword
                            stepMatch = stepText.match(/^\d+\.\s*(.+?)\s*\|\s*(.+)$/);
                        }
                        
                        if (!stepMatch) {
                            // Try format with just description (no expected result)
                            stepMatch = stepText.match(/^\d+\.\s*(.+)$/);
                        }
                        
                        if (stepMatch) {
                            const [, description, expectedResult] = stepMatch;
                            await TestCaseStep.create({
                                testCaseId: savedTestCase._id,
                                projectId: params.projectId,
                                userId: session.user?._id || session.user?.id,
                                description: description.trim(),
                                expectedResult: expectedResult ? expectedResult.trim() : '',
                                order: stepOrder,
                                selectedType: true,
                                additionalSelectType: ''
                            });
                            stepOrder++;
                        } else {
                            // If no pattern matches, treat the whole line as description
                            await TestCaseStep.create({
                                testCaseId: savedTestCase._id,
                                projectId: params.projectId,
                                userId: session.user?._id || session.user?.id,
                                description: stepText,
                                expectedResult: '',
                                order: stepOrder,
                                selectedType: true,
                                additionalSelectType: ''
                            });
                            stepOrder++;
                        }
                    }
                }

                // Create test data if provided
                if (testDataText) {
                    const testDataItems = testDataText.split('\n').filter((item: string) => item.trim());
                    let dataOrder = 0;
                    
                    for (let j = 0; j < testDataItems.length; j++) {
                        const dataText = testDataItems[j].trim();
                        
                        // Try multiple regex patterns for flexibility
                        let dataMatch = dataText.match(/^\d+\.\s*(.+?)\s*\((.+?)\):\s*(.+)$/);
                        
                        if (!dataMatch) {
                            // Try format without parentheses: "1. Field name: value"
                            dataMatch = dataText.match(/^\d+\.\s*(.+?):\s*(.+)$/);
                        }
                        
                        if (!dataMatch) {
                            // Try format with just field name: "1. Field name"
                            dataMatch = dataText.match(/^\d+\.\s*(.+)$/);
                        }
                        
                        if (dataMatch) {
                            const [, name, type, inputValue] = dataMatch;
                            await TestCaseData.create({
                                testCaseId: savedTestCase._id,
                                userId: session.user?._id || session.user?.id,
                                name: name.trim(),
                                type: type ? type.trim() : 'Text',
                                inputValue: inputValue ? inputValue.trim() : '',
                                description: '',
                                validation: []
                            });
                            dataOrder++;
                        } else {
                            // If no pattern matches, treat the whole line as name
                            await TestCaseData.create({
                                testCaseId: savedTestCase._id,
                                userId: session.user?._id || session.user?.id,
                                name: dataText,
                                type: 'Text',
                                inputValue: '',
                                description: '',
                                validation: []
                            });
                            dataOrder++;
                        }
                    }
                }

                results.created++;
            } catch (error) {
                console.error(`Error processing row ${i + 2}:`, error);
                results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                results.failed++;
            }
        }

        return NextResponse.json({
            message: `Import completed. Created: ${results.created}, Failed: ${results.failed}`,
            results
        });

    } catch (error) {
        return errorHandler(error);
    }
} 