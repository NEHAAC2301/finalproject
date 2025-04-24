import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  MessageSquare, 
  BookOpen, 
  Ticket, 
  Calendar, 
  MapPin, 
  BookOpen as BookIcon, 
  HelpCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { User, Ticket as TicketType } from "@shared/schema";
import useMobile from "@/hooks/use-mobile";
import { getQueryFn } from "@/lib/queryClient";

interface SidebarProps {
  user: User;
  activeTab: "chat" | "tickets" | "resources" | "appointments";
  setViewingTicketId?: (id: number | null) => void;
}

export default function Sidebar({ user, activeTab, setViewingTicketId }: SidebarProps) {
  const isMobile = useMobile();
  const [, setLocation] = useLocation();
  
  // Initialize with empty array and properly type the query
  const { data: tickets } = useQuery<TicketType[]>({
    queryKey: [`/api/tickets/${user.id}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    initialData: [] // Set initial data to empty array
  });
  
  // Use the tickets array safely now that it's initialized with empty array
  const recentTickets = tickets?.slice(0, 3) || [];
  
  if (isMobile) {
    return null;
  }
  
  const handleTicketClick = (ticketId: number) => {
    if (setViewingTicketId) {
      setViewingTicketId(ticketId);
    } else {
      setLocation(`/tickets/${ticketId}`);
    }
  };
  
  const navigateTo = (path: string) => {
    setLocation(path);
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search tickets, resources..." 
            className="pl-9 pr-4 py-2"
          />
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="mb-5">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </h3>
          <div className="mt-2 space-y-1">
            <div 
              onClick={() => navigateTo("/")}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                activeTab === "chat" 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <MessageSquare className={`mr-3 h-5 w-5 ${
                activeTab === "chat" ? "text-primary-500" : "text-gray-500"
              }`} />
              Support Chat
            </div>
            
            <div 
              onClick={() => navigateTo("/resources")}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                activeTab === "resources" 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookOpen className={`mr-3 h-5 w-5 ${
                activeTab === "resources" ? "text-primary-500" : "text-gray-500"
              }`} />
              Knowledge Base
            </div>
            
            <div 
              onClick={() => navigateTo("/tickets")}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                activeTab === "tickets" 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Ticket className={`mr-3 h-5 w-5 ${
                activeTab === "tickets" ? "text-primary-500" : "text-gray-500"
              }`} />
              My Tickets
              {Array.isArray(tickets) && tickets.length > 0 && (
                <span className="ml-auto bg-primary-100 text-primary-600 py-0.5 px-2 rounded-full text-xs font-medium">
                  {tickets.length}
                </span>
              )}
            </div>
            
            <div 
              onClick={() => navigateTo("/appointments")}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                activeTab === "appointments" 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Calendar className={`mr-3 h-5 w-5 ${
                activeTab === "appointments" ? "text-primary-500" : "text-gray-500"
              }`} />
              Appointments
            </div>
          </div>
        </div>
        
        {recentTickets.length > 0 && (
          <div className="mb-5">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Tickets
            </h3>
            <div className="mt-2 space-y-1">
              {recentTickets.map((ticket: TicketType) => (
                <div 
                  key={ticket.id} 
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <span 
                    className={`w-2 h-2 rounded-full mr-2 ${
                      ticket.status === 'open' 
                        ? 'bg-warning-500' 
                        : ticket.status === 'resolved' 
                          ? 'bg-success-500' 
                          : 'bg-error-500'
                    }`}
                  ></span>
                  <span className="truncate flex-1">{ticket.subject}</span>
                  <span className="text-xs text-gray-500">#{ticket.ticketNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-5">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Resources
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Calendar className="text-gray-500 mr-3 h-5 w-5" />
              Academic Calendar
            </div>
            <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
              <MapPin className="text-gray-500 mr-3 h-5 w-5" />
              Campus Map
            </div>
            <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
              <BookIcon className="text-gray-500 mr-3 h-5 w-5" />
              Course Catalog
            </div>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <HelpCircle className="text-secondary-500 h-5 w-5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-800">Need help?</h3>
              <p className="text-xs text-gray-500 mt-0.5">Contact IT support</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = "mailto:helpdesk@university.edu"} 
            className="mt-2 text-xs font-medium text-secondary-600 hover:text-secondary-700 block text-center w-full"
          >
            helpdesk@university.edu
          </button>
        </div>
      </div>
    </aside>
  );
}
