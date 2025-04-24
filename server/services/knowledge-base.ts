import { KnowledgeBaseItem } from "@shared/schema";
import { storage } from "../storage";

// Default knowledge base data for the university context
const defaultKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: 1,
    category: "academic",
    title: "Academic Policies",
    content: "The university's academic policies govern all aspects of academic life, including course registration, grading systems, academic integrity, and degree requirements. Students must maintain a minimum GPA of 2.0 to remain in good academic standing. Academic dishonesty, including plagiarism and cheating, is taken very seriously and can result in course failure or expulsion.",
    tags: ["policies", "academic", "integrity", "gpa"]
  },
  {
    id: 2,
    category: "academic",
    title: "Course Registration Process",
    content: "Course registration opens approximately 4 weeks before the start of each semester. Registration dates are determined by class standing, with seniors registering first, followed by juniors, sophomores, and freshmen. Students should meet with their academic advisor before registering to ensure they are on track to meet degree requirements. Course registration is completed through the student portal.",
    tags: ["registration", "courses", "enrollment", "advisor"]
  },
  {
    id: 3,
    category: "financial",
    title: "Financial Aid Information",
    content: "The university offers various types of financial aid, including scholarships, grants, loans, and work-study programs. To be considered for financial aid, students must complete the FAFSA by March 1st for the upcoming academic year. Scholarships are awarded based on academic merit, financial need, and other criteria. Students must maintain satisfactory academic progress to continue receiving financial aid.",
    tags: ["financial aid", "scholarships", "fafsa", "loans"]
  },
  {
    id: 4,
    category: "financial",
    title: "Tuition Payment Deadlines",
    content: "Tuition and fees are due by the first day of classes each semester. Students who fail to pay by the deadline will be charged a late fee and may have a financial hold placed on their account. Payment plans are available for students who need to spread payments throughout the semester. A financial hold prevents students from registering for courses, accessing transcripts, and receiving diplomas.",
    tags: ["tuition", "payment", "deadlines", "holds"]
  },
  {
    id: 5,
    category: "campus",
    title: "Campus Facilities",
    content: "The university campus includes academic buildings, residence halls, dining facilities, recreation centers, and study spaces. The main library is open 24/7 during the academic year. Computer labs are available in multiple locations across campus. The student recreation center offers fitness equipment, group classes, and intramural sports. All facilities are accessible with a valid student ID card.",
    tags: ["facilities", "campus", "library", "recreation"]
  },
  {
    id: 6,
    category: "it",
    title: "IT Services",
    content: "University IT services include campus WiFi, computer labs, printing services, and technical support. Students are provided with a university email account and access to various software applications. Technical support is available through the IT Help Desk, which can be contacted by phone, email, or in person. WiFi access requires authentication with student credentials.",
    tags: ["it", "wifi", "technical support", "email"]
  },
  {
    id: 7,
    category: "wellness",
    title: "Student Wellness Services",
    content: "The university provides comprehensive wellness services, including physical health, mental health, and counseling services. The health center offers primary care, vaccinations, and health education. Counseling services are confidential and include individual therapy, group sessions, and crisis intervention. Students can make appointments online through the student portal or by calling the health center directly.",
    tags: ["wellness", "health", "counseling", "mental health"]
  },
  {
    id: 8,
    category: "housing",
    title: "Housing and Accommodation",
    content: "On-campus housing includes traditional residence halls, suites, and apartments. Housing applications for the upcoming academic year open in February. Room selection is based on class standing and application date. All residence halls have resident assistants (RAs) who provide support and organize community events. First-year students are generally required to live on campus unless they commute from a parent's home within 30 miles of campus.",
    tags: ["housing", "residence halls", "accommodation", "dormitories"]
  },
  {
    id: 9,
    category: "library",
    title: "Library Resources",
    content: "The university library system includes the main library and several specialized libraries. Resources include books, journals, databases, and special collections. Librarians are available to assist with research questions and information literacy. Study rooms can be reserved online. Interlibrary loan services allow students to request materials from other libraries. Digital resources are accessible 24/7 through the library website.",
    tags: ["library", "research", "books", "databases"]
  },
  {
    id: 10,
    category: "career",
    title: "Career Services",
    content: "The Career Center provides resources for career exploration, job and internship searches, resume and cover letter writing, interview preparation, and networking. Career counselors are available for individual appointments. The university hosts career fairs each semester and maintains an online job board. Alumni mentoring programs connect students with professionals in their field of interest.",
    tags: ["career", "jobs", "internships", "resume"]
  }
];

// Initialize knowledge base with default data if empty
export async function initializeKnowledgeBase() {
  const items = await storage.getAllKnowledgeBaseItems();
  
  if (items.length === 0) {
    for (const item of defaultKnowledgeBase) {
      await storage.createKnowledgeBaseItem({
        category: item.category,
        title: item.title,
        content: item.content,
        tags: item.tags
      });
    }
    console.log("Knowledge base initialized with default data");
  }
}

// Get knowledge base items by category or keywords
export async function getKnowledgeBaseItems(category?: string, keywords?: string[]): Promise<KnowledgeBaseItem[]> {
  try {
    // Initialize knowledge base if needed
    await initializeKnowledgeBase();
    
    let items: KnowledgeBaseItem[] = [];
    
    if (category) {
      items = await storage.getKnowledgeBaseItemsByCategory(category);
    }
    
    // If no category specified or no items found for category, return all items
    if (!category || items.length === 0) {
      items = await storage.getAllKnowledgeBaseItems();
    }
    
    // If keywords provided, filter results further
    if (keywords && keywords.length > 0) {
      items = items.filter(item => {
        const lowerContent = item.content.toLowerCase();
        const lowerTitle = item.title.toLowerCase();
        
        // Check if any keyword matches content, title or tags
        return keywords.some(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          return lowerContent.includes(lowerKeyword) || 
                 lowerTitle.includes(lowerKeyword) ||
                 item.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
        });
      });
    }
    
    return items;
  } catch (error) {
    console.error("Error retrieving knowledge base items:", error);
    return [];
  }
}

// Add a batch of items to the knowledge base
export async function addBatchToKnowledgeBase(items: Array<{
  category: string;
  title: string;
  content: string;
  tags: string[];
}>): Promise<{
  success: boolean;
  added: number;
  errors: Array<{item: any, error: string}>;
}> {
  const result: {
    success: boolean;
    added: number;
    errors: Array<{item: any, error: string}>;
  } = {
    success: true,
    added: 0,
    errors: []
  };
  
  try {
    for (const item of items) {
      try {
        // Validate the item has all required fields
        if (!item.category || !item.title || !item.content) {
          result.errors.push({
            item,
            error: 'Missing required fields (category, title, or content)'
          });
          continue;
        }
        
        // Ensure tags is an array
        const tags = Array.isArray(item.tags) ? item.tags : 
                    (typeof item.tags === 'string' ? [item.tags] : []);
        
        // Add the item to the knowledge base
        await storage.createKnowledgeBaseItem({
          category: item.category,
          title: item.title,
          content: item.content,
          tags: tags
        });
        
        result.added++;
      } catch (itemError: any) {
        result.errors.push({
          item,
          error: itemError?.message || 'Unknown error adding knowledge base item'
        });
      }
    }
    
    // Mark as unsuccessful if no items were added
    if (result.added === 0 && items.length > 0) {
      result.success = false;
    }
    
    return result;
  } catch (error: any) {
    console.error("Error adding batch to knowledge base:", error);
    return {
      success: false,
      added: result.added,
      errors: [...result.errors, { 
        item: null, 
        error: error?.message || 'Unknown batch processing error'
      }]
    };
  }
}

// Process a text document into knowledge base items
export async function processTextDocument(
  text: string, 
  category: string,
  chunkSize: number = 1000,
  overlapSize: number = 200
): Promise<{
  success: boolean;
  itemsAdded: number;
}> {
  try {
    // Basic text chunking logic
    const chunks: Array<{
      category: string;
      title: string;
      content: string;
      tags: string[];
    }> = [];
    let startIndex = 0;
    
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      let chunk = text.substring(startIndex, endIndex);
      
      // If we're not at the end of the text and not at a sentence boundary,
      // try to find a better break point
      if (endIndex < text.length) {
        // Look for sentence endings (.?!) followed by a space or newline
        const sentenceEndMatch = chunk.match(/[.?!][^.?!]*$/);
        if (sentenceEndMatch) {
          // Adjust the chunk to end at a sentence
          const sentenceEndPos = chunk.lastIndexOf(sentenceEndMatch[0]);
          if (sentenceEndPos > chunkSize / 2) { // Ensure we don't make chunks too small
            chunk = chunk.substring(0, sentenceEndPos + 1);
          }
        }
      }
      
      // Create a title for this chunk - use the first sentence or first 50 chars
      let title = chunk.split(/[.!?]\s+/)[0].trim();
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Extract potential tags from the content
      const wordFrequency = new Map<string, number>();
      const words = chunk.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      words.forEach(word => {
        if (!['and', 'the', 'for', 'with', 'this', 'that', 'from'].includes(word)) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
      
      // Sort words by frequency and take top 5 as tags
      const tags = Array.from(wordFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      chunks.push({
        category,
        title,
        content: chunk,
        tags
      });
      
      // Move start index forward, with overlap
      startIndex = endIndex - overlapSize;
    }
    
    // Add chunks to knowledge base
    const result = await addBatchToKnowledgeBase(chunks);
    
    return {
      success: result.success,
      itemsAdded: result.added
    };
  } catch (error: any) {
    console.error("Error processing text document:", error);
    return {
      success: false,
      itemsAdded: 0
    };
  }
}
