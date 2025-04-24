import OpenAI from "openai";
import { Departments, TicketStatus } from "@shared/schema";
import type { KnowledgeBaseItem } from "@shared/schema";
import fs from "fs";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

interface QueryAnalysis {
  category: string;
  keywords: string[];
  intent: string;
  complexity: number; // 1-10 scale (10 being most complex)
  personalDataRequest: boolean;
  ticketCategories: string[];
}

interface ResponseAnalysis {
  needsTicket: boolean;
  department: string;
  reasonForTicket: string;
  responseQuality: {
    completeness: number; // 1-5 scale
    accuracy: number; // 1-5 scale
    clarity: number; // 1-5 scale
    actionability: number; // 1-5 scale
    relevance: number; // 1-5 scale
  };
}

interface GeneratedResponse {
  text: string;
  analysis: ResponseAnalysis;
  needsTicket: boolean;
  department: string;
}

export async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a university support system that analyzes student queries. Analyze the query and provide the following information in JSON format:
          - category: The main category of the query (academic, administrative, technical, financial, etc.)
          - keywords: List of important keywords in the query
          - intent: The student's main intention or need
          - complexity: Rate the complexity on a scale of 1-10
          - personalDataRequest: Boolean indicating if the query requires access to personal student data
          - ticketCategories: List potential departments this might need to be routed to if complex`
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    return {
      category: result.category,
      keywords: result.keywords,
      intent: result.intent,
      complexity: result.complexity,
      personalDataRequest: result.personalDataRequest,
      ticketCategories: result.ticketCategories
    };
  } catch (error) {
    console.error("Error analyzing query:", error);
    // Default analysis if OpenAI fails
    return {
      category: "general",
      keywords: [],
      intent: "unknown",
      complexity: 5,
      personalDataRequest: false,
      ticketCategories: [Departments.ACADEMIC_AFFAIRS]
    };
  }
}

export async function generateResponse(
  query: string, 
  analysis: QueryAnalysis,
  knowledgeItems: KnowledgeBaseItem[]
): Promise<GeneratedResponse> {
  try {
    // Format knowledge base items for the prompt
    const knowledgeText = knowledgeItems.map(item => 
      `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}`
    ).join("\n\n");
    
    const systemPrompt = `You are UniAssist, the University Internal Support Assistant designed to help students with their queries. 
    Follow these guidelines:
    
    1. Provide accurate, helpful information in a professional and supportive tone
    2. Use the knowledge base information provided below when available
    3. For each response, assess if a support ticket should be created based on these criteria:
       - The query requires specific case handling beyond general information
       - The query involves a technical issue that needs IT support
       - The query requires authorization from university staff
       - The query involves confidential student information
       - The knowledge base does not contain sufficient information
       - The query requires coordination between multiple departments
    
    4. After generating your response, analyze its quality on:
       - Completeness (1-5): Does it address all aspects of the query?
       - Accuracy (1-5): Is the information correct and up-to-date?
       - Clarity (1-5): Is it easy to understand?
       - Actionability (1-5): Does it provide clear next steps?
       - Relevance (1-5): Does it address the student's specific situation?
    
    5. Return a JSON object with:
       - text: Your helpful response to the student
       - analysis: {
          needsTicket: boolean,
          department: appropriate department if ticket needed,
          reasonForTicket: explanation of why a ticket is needed,
          responseQuality: {
            completeness: number,
            accuracy: number,
            clarity: number,
            actionability: number,
            relevance: number
          }
       }
    
    Knowledge Base Information:
    ${knowledgeText}
    
    Query Analysis:
    - Category: ${analysis.category}
    - Keywords: ${analysis.keywords.join(', ')}
    - Intent: ${analysis.intent}
    - Complexity: ${analysis.complexity}
    - Personal Data Request: ${analysis.personalDataRequest}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    // Determine which department to route to if ticket is needed
    let department = Departments.ACADEMIC_AFFAIRS;
    
    if (result.analysis.needsTicket) {
      department = result.analysis.department || 
        (analysis.ticketCategories && analysis.ticketCategories.length > 0 ? 
          analysis.ticketCategories[0] : Departments.ACADEMIC_AFFAIRS);
    }
    
    return {
      text: result.text,
      analysis: result.analysis,
      needsTicket: result.analysis.needsTicket,
      department: department
    };
  } catch (error) {
    console.error("Error generating response:", error);
    // Fallback response
    return {
      text: "I apologize, but I'm having trouble processing your request right now. Could you please try again or rephrase your question?",
      analysis: {
        needsTicket: true,
        department: Departments.IT_SUPPORT,
        reasonForTicket: "AI response generation failure",
        responseQuality: {
          completeness: 1,
          accuracy: 1,
          clarity: 3,
          actionability: 2,
          relevance: 1
        }
      },
      needsTicket: true,
      department: Departments.IT_SUPPORT
    };
  }
}

// Audio transcription function
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<{ text: string, duration: number }> {
  try {
    // Save the buffer to a temporary file
    const tempFilePath = `/tmp/${filename}`;
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    // Create a readable stream from the file
    const audioStream = fs.createReadStream(tempFilePath);
    
    // Call OpenAI's transcription API
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
    });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    // The Whisper API doesn't return duration directly, so we estimate or use a default
    return {
      text: transcription.text,
      duration: 0, // Default duration since it's not provided by the API
    };
  } catch (error: any) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error?.message || 'Unknown error'}`);
  }
}
