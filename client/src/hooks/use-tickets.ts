import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Ticket, TicketUpdate } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useTickets(userId: number) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();
  
  const { 
    data: tickets, 
    isLoading: ticketsLoading, 
    error: ticketsError 
  } = useQuery({
    queryKey: [`/api/tickets/${userId}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { 
    data: ticketDetails, 
    isLoading: ticketDetailsLoading,
  } = useQuery({
    queryKey: [`/api/ticket/${selectedTicket?.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedTicket,
  });
  
  useEffect(() => {
    if (ticketsError) {
      toast({
        title: "Error loading tickets",
        description: "Failed to load your tickets. Please try again later.",
        variant: "destructive",
      });
    }
  }, [ticketsError, toast]);
  
  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };
  
  const getTicketById = (ticketId: number) => {
    if (!tickets) return null;
    return tickets.find((ticket: Ticket) => ticket.id === ticketId) || null;
  };
  
  return {
    tickets,
    ticketsLoading,
    selectedTicket,
    selectTicket,
    ticketDetails,
    ticketDetailsLoading,
    getTicketById,
  };
}
