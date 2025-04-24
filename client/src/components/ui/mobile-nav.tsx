import { useLocation } from "wouter";
import { MessageSquare, Book, Ticket, Menu } from "lucide-react";
import useMobile from "@/hooks/use-mobile";

interface MobileNavProps {
  activeTab: "chat" | "resources" | "tickets" | "menu";
}

export default function MobileNav({ activeTab }: MobileNavProps) {
  const isMobile = useMobile();
  const [, setLocation] = useLocation();
  
  if (!isMobile) {
    return null;
  }
  
  const navigateTo = (path: string) => {
    setLocation(path);
  };
  
  return (
    <div className="bg-white border-t border-gray-200 py-2 px-4 flex items-center justify-around">
      <div 
        onClick={() => navigateTo("/")}
        className={`flex flex-col items-center cursor-pointer ${activeTab === "chat" ? "text-primary-500" : "text-gray-500"}`}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-xs mt-1">Chat</span>
      </div>
      
      <div 
        onClick={() => navigateTo("/resources")}
        className={`flex flex-col items-center cursor-pointer ${activeTab === "resources" ? "text-primary-500" : "text-gray-500"}`}
      >
        <Book className="h-5 w-5" />
        <span className="text-xs mt-1">Resources</span>
      </div>
      
      <div 
        onClick={() => navigateTo("/tickets")}
        className={`flex flex-col items-center cursor-pointer ${activeTab === "tickets" ? "text-primary-500" : "text-gray-500"}`}
      >
        <Ticket className="h-5 w-5" />
        <span className="text-xs mt-1">Tickets</span>
      </div>
      
      <div 
        onClick={() => navigateTo("/menu")}
        className={`flex flex-col items-center cursor-pointer ${activeTab === "menu" ? "text-primary-500" : "text-gray-500"}`}
      >
        <Menu className="h-5 w-5" />
        <span className="text-xs mt-1">Menu</span>
      </div>
    </div>
  );
}
