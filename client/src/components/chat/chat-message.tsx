import { Bot, User } from "lucide-react";
import { MessageRole } from "@shared/schema";

interface ChatMessageProps {
  role: string;
  content: string;
  timestamp?: Date | string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAssistant = role === MessageRole.ASSISTANT;
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';
  
  return (
    <div className={`flex ${isAssistant ? '' : 'justify-end'}`}>
      <div className={`chat-bubble ${isAssistant ? 'assistant bg-secondary-50' : 'user bg-primary-50'} text-gray-800`}>
        {isAssistant && (
          <div className="flex items-center mb-2">
            <div className="bg-secondary-100 p-1 rounded-full">
              <Bot className="text-secondary-500 h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium text-secondary-600">Ammu</span>
            <span className="ml-auto text-xs text-gray-400">{formattedTime}</span>
          </div>
        )}
        
        <div className="space-y-3">
          {content.split('\n\n').map((paragraph, index) => {
            // Check if this is a list
            if (paragraph.includes('\n- ')) {
              const [listTitle, ...listItems] = paragraph.split('\n- ');
              return (
                <div key={index}>
                  {listTitle && <p>{listTitle}</p>}
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {listItems.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.includes('<span class="font-medium">') ? (
                          <div dangerouslySetInnerHTML={{ __html: item }} />
                        ) : item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            
            // Otherwise render as paragraph
            return <p key={index}>{paragraph}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
