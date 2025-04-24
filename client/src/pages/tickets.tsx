import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/ui/mobile-nav";
import TicketPanel from "@/components/tickets/ticket-panel";
import TicketStatus from "@/components/tickets/ticket-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Ticket } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

interface TicketsProps {
  user: User;
  ticketId?: string;
}

export default function Tickets({ user, ticketId }: TicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const { data: tickets, isLoading } = useQuery({
    queryKey: [`/api/tickets/${user.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: ticketDetails } = useQuery({
    queryKey: [`/api/ticket/${ticketId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!ticketId,
  });
  
  useEffect(() => {
    if (ticketId && tickets) {
      const ticket = tickets.find((t: Ticket) => t.id.toString() === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    } else if (ticketDetails) {
      setSelectedTicket(ticketDetails.ticket);
    }
  }, [ticketId, tickets, ticketDetails]);

  return (
    <div className="bg-gray-50 h-screen flex flex-col">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} activeTab="tickets" />
        
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h1>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tickets?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets.map((ticket: Ticket) => (
                    <Card 
                      key={ticket.id} 
                      className={`cursor-pointer hover:shadow transition-shadow ${
                        selectedTicket?.id === ticket.id ? 'border-primary-500 ring-1 ring-primary-500' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            {ticket.subject}
                          </CardTitle>
                          <TicketStatus status={ticket.status} />
                        </div>
                        <p className="text-sm text-gray-500">#{ticket.ticketNumber}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                            <span className="text-xs text-gray-500">{ticket.department}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <i className="bx bx-ticket text-4xl text-gray-400 mb-2"></i>
                    <h3 className="text-lg font-medium text-gray-700">No tickets found</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      When you need help with something that can't be resolved in chat,
                      a support ticket will be created here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
        
        {selectedTicket && (
          <TicketPanel ticket={selectedTicket} />
        )}
      </div>
      
      <MobileNav activeTab="tickets" />
    </div>
  );
}
