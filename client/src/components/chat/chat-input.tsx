import { useState, useRef, useEffect } from "react";
import { Paperclip, Link2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

export default function ChatInput({ onSendMessage, isDisabled = false }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };
  
  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="p-2 text-gray-400 hover:text-gray-600"
              disabled={isDisabled}
            >
              <Link2 className="h-5 w-5" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={1}
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-gray-600 placeholder-gray-400 overflow-auto max-h-32 focus:outline-none"
              placeholder="Type your question here..."
              disabled={isDisabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="flex items-center pr-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={isDisabled}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <Button 
                type="submit" 
                className="ml-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md px-4 py-2 font-medium text-sm transition-colors duration-150"
                disabled={isDisabled || !message.trim()}
              >
                <span>Send</span>
                <Send className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 px-2 flex items-center">
            <i className="bx bx-info-circle mr-1"></i>
            <span>Your conversations are saved to provide better support</span>
          </div>
        </form>
      </div>
    </div>
  );
}
