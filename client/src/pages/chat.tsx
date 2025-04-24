import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ChatInput from "@/components/chat/chat-input";
import ChatMessage from "@/components/chat/chat-message";
import ChatWelcome from "@/components/chat/chat-welcome";
import MobileNav from "@/components/ui/mobile-nav";
import TicketPanel from "@/components/tickets/ticket-panel";
import { useChat } from "@/hooks/use-chat";
import { User } from "@shared/schema";

interface ChatProps {
  user: User;
}

export default function Chat({ user }: ChatProps) {
  const [viewingTicketId, setViewingTicketId] = useState<number | null>(null);
  const { 
    messages, 
    conversationId, 
    sendMessage, 
    loading, 
    currentTicket 
  } = useChat(user.id);
  
  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };
  
  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="bg-gray-50 h-screen flex flex-col">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} activeTab="chat" setViewingTicketId={setViewingTicketId} />
        
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div 
            className="flex-1 overflow-y-auto p-6 bg-gray-50" 
            id="chatContainer"
          >
            {messages.length === 0 ? (
              <ChatWelcome onQuickQuestion={handleQuickQuestion} />
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
                {loading && (
                  <div className="flex">
                    <div className="chat-bubble assistant bg-secondary-50 text-gray-800">
                      <div className="flex items-center mb-2">
                        <div className="bg-secondary-100 p-1 rounded-full">
                          <i className="bx bx-bot text-secondary-500 text-sm"></i>
                        </div>
                        <span className="ml-2 text-sm font-medium text-secondary-600">Ammu</span>
                        <span className="ml-auto text-xs text-gray-400">Just now</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: "0.2s"}}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: "0.4s"}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <ChatInput onSendMessage={handleSendMessage} isDisabled={loading} />
        </main>
        
        {currentTicket && (
          <TicketPanel ticket={currentTicket} />
        )}
      </div>
      
      <MobileNav activeTab="chat" />
    </div>
  );
}
