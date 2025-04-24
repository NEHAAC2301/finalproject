import { Bot, BookOpen, Calendar, DollarSign, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  onQuickQuestion: (question: string) => void;
}

export default function ChatWelcome({ onQuickQuestion }: ChatWelcomeProps) {
  const handleQuickQuestion = (question: string) => {
    onQuickQuestion(question);
  };
  
  return (
    <div className="mx-auto max-w-3xl mb-8">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="bg-primary-50 p-2 rounded-full">
            <Bot className="text-primary-500 h-6 w-6" />
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-800">Welcome to Ammu</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          I'm here to help with your university-related questions. You can ask about:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <Button 
            variant="outline" 
            className="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700"
            onClick={() => handleQuickQuestion("What are the academic policies regarding course withdrawal?")}
          >
            <BookOpen className="text-secondary-500 mr-2 h-4 w-4" /> 
            Academic Policies
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700"
            onClick={() => handleQuickQuestion("How do I register for courses next semester?")}
          >
            <Calendar className="text-secondary-500 mr-2 h-4 w-4" /> 
            Course Registration
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700"
            onClick={() => handleQuickQuestion("What financial aid options are available for next year?")}
          >
            <DollarSign className="text-secondary-500 mr-2 h-4 w-4" /> 
            Financial Aid
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-gray-50 hover:bg-gray-100 text-gray-700"
            onClick={() => handleQuickQuestion("What campus facilities are open during the weekend?")}
          >
            <Building className="text-secondary-500 mr-2 h-4 w-4" /> 
            Campus Facilities
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          Previous conversations are saved for your reference. How can I help you today?
        </p>
      </div>
    </div>
  );
}
