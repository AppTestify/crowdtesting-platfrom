import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { verifySession } from "@/app/_lib/dal";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const { description, context } = await req.json();

    if (!description || description.trim().length === 0) {
      return Response.json(
        { message: "Description is required" },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    // Using a free AI service - you can integrate with:
    // 1. Groq (free tier) - https://groq.com/
    // 2. Hugging Face Inference API (free tier)
    // 3. OpenAI (with API key)
    // 4. Anthropic Claude (with API key)
    
    const refinedDescription = await refineDescriptionWithAI(description, context);

    return Response.json({
      originalDescription: description,
      refinedDescription,
      message: "Description refined successfully"
    }, { status: HttpStatusCode.OK });

  } catch (error) {
    return errorHandler(error);
  }
}

async function refineDescriptionWithAI(description: string, context?: string): Promise<string> {
  try {
    // Example integration with Groq (free tier)
    // Uncomment and configure when you have an API key
    /*
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Free model
        messages: [
          {
            role: 'system',
            content: 'You are a professional requirements analyst. Your task is to refine and improve requirement descriptions to make them clear, detailed, and professional.'
          },
          {
            role: 'user',
            content: `Please refine and improve the following requirement description. Make it more clear, detailed, and professional while maintaining the original intent.

${context ? `Context: ${context}` : ''}

Original description: ${description}

Please provide a refined version that is:
1. Clear and concise
2. Technically accurate
3. Well-structured with proper formatting
4. Professional in tone
5. Includes acceptance criteria if applicable
6. Uses markdown formatting for better readability

Return only the refined description without any additional commentary.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || description;
    */

    // For demonstration, using enhanced text processing
    // Replace this with actual AI API call when you have API keys
    const refinedDescription = await simulateAIRefinement(description, context);
    
    return refinedDescription;
  } catch (error) {
    console.error("AI refinement error:", error);
    // Fallback to basic enhancement if AI service fails
    return await simulateAIRefinement(description, context);
  }
}

// Enhanced simulation that provides better formatting and structure
async function simulateAIRefinement(description: string, context?: string): Promise<string> {
  // Parse the original description to understand its structure
  const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
  const sentences = cleanDescription.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return description;
  }

  let refined = '';
  
  // Add overview section
  refined += `## Overview\n\n`;
  refined += `${sentences[0].trim()}.`;
  
  if (sentences.length > 1) {
    refined += ` ${sentences[1].trim()}.`;
  }
  
  refined += `\n\n`;
  
  // Add detailed description if there are more sentences
  if (sentences.length > 2) {
    refined += `## Detailed Description\n\n`;
    refined += sentences.slice(2).map(s => s.trim()).join('. ') + '.';
    refined += `\n\n`;
  }
  
  // Add functional requirements
  refined += `## Functional Requirements\n\n`;
  refined += `- The system shall implement the described functionality\n`;
  refined += `- All user interactions should be intuitive and responsive\n`;
  refined += `- Error handling should be comprehensive and user-friendly\n\n`;
  
  // Add acceptance criteria
  refined += `## Acceptance Criteria\n\n`;
  refined += `- [ ] All specified functionality is implemented correctly\n`;
  refined += `- [ ] Code follows project coding standards and best practices\n`;
  refined += `- [ ] Unit tests are written and passing\n`;
  refined += `- [ ] Integration testing is completed successfully\n`;
  refined += `- [ ] User acceptance testing is performed and approved\n`;
  refined += `- [ ] Documentation is updated as needed\n\n`;
  
  // Add technical considerations
  refined += `## Technical Considerations\n\n`;
  refined += `- Ensure compatibility with existing system architecture\n`;
  refined += `- Consider performance implications and optimize accordingly\n`;
  refined += `- Implement proper security measures where applicable\n`;
  refined += `- Follow accessibility guidelines for user interfaces\n\n`;
  
  // Add notes section
  refined += `## Implementation Notes\n\n`;
  refined += `- Review and identify all dependencies before starting development\n`;
  refined += `- Coordinate with relevant team members and stakeholders\n`;
  refined += `- Plan for adequate testing time in the development schedule\n`;
  refined += `- Consider potential edge cases and error scenarios\n\n`;
  
  // Add context if provided
  if (context) {
    refined += `## Context\n\n`;
    refined += `${context}\n\n`;
  }
  
  return refined;
} 