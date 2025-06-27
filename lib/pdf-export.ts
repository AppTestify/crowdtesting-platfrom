import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProjectData {
    title: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    clientName?: string;
}

interface DashboardData {
    totalIssues: number;
    totalTestCases: number;
    totalTestCycles: number;
    criticalIssues: number;
    status: any;
    task: any;
    testCaseType: any;
    testCaseSeverity: any;
    topDevices: any;
    requirementStatus: any;
    assignedIssueCounts: any[];
    assignedRequirementCounts: any[];
}

export class DashboardPDFExporter {
    private pdf: jsPDF;
    private currentY: number = 10;
    private pageHeight: number = 297; // A4 height in mm
    private pageWidth: number = 210; // A4 width in mm
    private margin: number = 10;

    constructor() {
        this.pdf = new jsPDF('p', 'mm', 'a4');
    }

    // Helper function to extract text content from HTML strings
    private extractTextContent(htmlString: string | undefined): string {
        if (!htmlString) return '';
        
        try {
            // Create a temporary div element to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;
            
            // Return text content, fallback to original string if no HTML
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            return textContent.trim() || htmlString;
        } catch (error) {
            // Fallback for server-side or if DOM is not available
            return htmlString.replace(/<[^>]*>/g, '').trim();
        }
    }

    private checkPageBreak(additionalHeight: number = 20): boolean {
        if (this.currentY + additionalHeight > this.pageHeight - this.margin - 10) {
            this.pdf.addPage();
            this.currentY = this.margin;
            return true;
        }
        return false;
    }

    private async captureElementAsImage(selector: string, options: any = {}): Promise<string | null> {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                console.warn(`Element not found: ${selector}`);
                return null;
            }

            // Ensure element is visible
            element.scrollIntoView({ behavior: 'auto', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                ...options
            });

            return canvas.toDataURL('image/png', 0.95);
        } catch (error) {
            console.error(`Error capturing ${selector}:`, error);
            return null;
        }
    }

    private addTitle(title: string, projectName: string): void {
        // Modern header background
        this.pdf.setFillColor(59, 130, 246);
        this.pdf.rect(0, 0, this.pageWidth, 25, 'F');
        
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.setFontSize(20);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(title, this.margin, 15);
        
        // Add project name on the right side of header
        this.pdf.setFontSize(14);
        this.pdf.setFont('helvetica', 'normal');
        const cleanProjectName = this.extractTextContent(projectName);
        const projectNameWidth = this.pdf.getTextWidth(cleanProjectName);
        this.pdf.text(cleanProjectName, this.pageWidth - this.margin - projectNameWidth, 12);
        
        // Add timestamp below project name, right-aligned
        this.pdf.setFontSize(10);
        const now = new Date();
        const timestamp = `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        const timestampWidth = this.pdf.getTextWidth(timestamp);
        this.pdf.text(timestamp, this.pageWidth - this.margin - timestampWidth, 20);
        
        this.currentY = 35;
    }

    private async addImageSection(imageData: string, maxWidth?: number, maxHeight?: number): Promise<void> {
        if (!imageData) return;

        const img = new Image();
        img.src = imageData;
        
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // Calculate dimensions to fit page
        const availableWidth = maxWidth || (this.pageWidth - 2 * this.margin);
        const availableHeight = maxHeight || (this.pageHeight - this.currentY - this.margin - 20);
        
        const widthRatio = availableWidth / imgWidth;
        const heightRatio = availableHeight / imgHeight;
        const ratio = Math.min(widthRatio, heightRatio, 1); // Don't scale up
        
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        // Check if we need a new page
        if (this.checkPageBreak(finalHeight + 5)) {
            // Recalculate available height for new page
            const newAvailableHeight = this.pageHeight - this.currentY - this.margin - 20;
            const newHeightRatio = newAvailableHeight / imgHeight;
            const newRatio = Math.min(widthRatio, newHeightRatio, 1);
            const newFinalHeight = imgHeight * newRatio;
            
            this.pdf.addImage(imageData, 'PNG', this.margin, this.currentY, 
                            imgWidth * newRatio, newFinalHeight);
            this.currentY += newFinalHeight + 5;
        } else {
            this.pdf.addImage(imageData, 'PNG', this.margin, this.currentY, finalWidth, finalHeight);
            this.currentY += finalHeight + 5;
        }
    }

    public async generatePDF(projectData: ProjectData, dashboardData: DashboardData): Promise<void> {
        try {
            // Clean project name for filename
            const cleanProjectName = this.extractTextContent(projectData.title);
            
            // Add title page with project name in header
            this.addTitle('Project Dashboard Report', projectData.title);
            
            // Add project info if available
            this.pdf.setFontSize(14);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(51, 51, 51);
            this.pdf.text('Project Information', this.margin, this.currentY);
            this.currentY += 8;
            
            this.pdf.setFontSize(11);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.text(`Project: ${cleanProjectName}`, this.margin, this.currentY);
            this.currentY += 6;
            this.pdf.text(`Status: ${projectData.status}`, this.margin, this.currentY);
            this.currentY += 6;
            this.pdf.text(`Timeline: ${projectData.startDate} - ${projectData.endDate}`, this.margin, this.currentY);
            this.currentY += 15;

            // Capture KPI cards section
            console.log('Capturing KPI cards...');
            const kpiImage = await this.captureElementAsImage('[data-pdf-section="kpi-cards"]');
            if (kpiImage) {
                this.pdf.setFontSize(14);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.text('Key Performance Indicators', this.margin, this.currentY);
                this.currentY += 10;
                await this.addImageSection(kpiImage, undefined, 60);
            }

            // Capture progress overview section
            console.log('Capturing progress overview...');
            const progressImage = await this.captureElementAsImage('[data-pdf-section="progress-overview"]');
            if (progressImage) {
                this.checkPageBreak(80);
                this.pdf.setFontSize(14);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.text('Progress Overview', this.margin, this.currentY);
                this.currentY += 10;
                await this.addImageSection(progressImage, undefined, 70);
            }

            // Capture individual chart sections with better selectors
            const chartSections = [
                { selector: '[data-pdf-section="issue-analysis"]', title: 'Issue Analysis' },
                { selector: '[data-pdf-section="status-progress"]', title: 'Status & Progress' },
                { selector: '[data-pdf-section="testing-overview"]', title: 'Testing Overview' },
                { selector: '[data-pdf-section="technical-insights"]', title: 'Technical Insights' }
            ];

            for (const section of chartSections) {
                console.log(`Capturing ${section.title}...`);
                
                const sectionImage = await this.captureElementAsImage(section.selector);
                
                if (sectionImage) {
                    this.checkPageBreak(100);
                    this.pdf.setFontSize(14);
                    this.pdf.setFont('helvetica', 'bold');
                    this.pdf.text(section.title, this.margin, this.currentY);
                    this.currentY += 10;
                    await this.addImageSection(sectionImage, undefined, 80);
                } else {
                    console.warn(`Could not capture ${section.title}`);
                }
            }

            // Capture team workload section
            console.log('Capturing team workload...');
            const teamImage = await this.captureElementAsImage('[data-pdf-section="team-workload"]');
            if (teamImage) {
                this.checkPageBreak(100);
                this.pdf.setFontSize(14);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.text('Team Workload', this.margin, this.currentY);
                this.currentY += 10;
                await this.addImageSection(teamImage, undefined, 90);
            }

            // If individual sections failed, try to capture the entire dashboard
            if (!kpiImage && !progressImage && !teamImage) {
                console.log('Fallback: Capturing entire dashboard...');
                
                // Try different selectors for the main dashboard
                const dashboardSelectors = [
                    '.space-y-8.pb-8',
                    '[class*="space-y-8"]',
                    'main',
                    '.container'
                ];

                for (const selector of dashboardSelectors) {
                    const dashboardImage = await this.captureElementAsImage(selector, {
                        height: Math.max(document.documentElement.scrollHeight, window.innerHeight),
                        width: window.innerWidth,
                        scrollX: 0,
                        scrollY: 0
                    });
                    
                    if (dashboardImage) {
                        this.checkPageBreak(150);
                        this.pdf.setFontSize(14);
                        this.pdf.setFont('helvetica', 'bold');
                        this.pdf.text('Complete Dashboard', this.margin, this.currentY);
                        this.currentY += 10;
                        await this.addImageSection(dashboardImage);
                        break;
                    }
                }
            }

            // Add footer to all pages
            const pageCount = this.pdf.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                this.pdf.setPage(i);
                this.pdf.setFontSize(8);
                this.pdf.setTextColor(128, 128, 128);
                this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin - 15, this.pageHeight - 5);
                this.pdf.text('Crowd Testing Dashboard Report', this.margin, this.pageHeight - 5);
            }

            // Generate filename with project name and timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const safeProjectName = cleanProjectName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
            const filename = `${safeProjectName}-dashboard-${timestamp}.pdf`;
            
            this.pdf.save(filename);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF report');
        }
    }
}

export const exportDashboardToPDF = async (projectData: ProjectData, dashboardData: DashboardData) => {
    const exporter = new DashboardPDFExporter();
    await exporter.generatePDF(projectData, dashboardData);
}; 