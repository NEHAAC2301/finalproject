import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Timer, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ticket, TicketCreator } from "@shared/schema";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import TicketStatus from "./ticket-status";
import useMobile from "@/hooks/use-mobile";

interface TicketPanelProps {
  ticket: Ticket;
}

interface TicketUpdateFormData {
  ticketId: number;
  content: string;
  creator: string;
}

export default function TicketPanel({ ticket }: TicketPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const isMobile = useMobile();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: [`/api/ticket/${ticket.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const addMessageMutation = useMutation({
    mutationFn: async (data: TicketUpdateFormData) => {
      const response = await apiRequest("POST", "/api/ticket-update", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ticket/${ticket.id}`] });
      setNewMessage("");
    },
  });
  
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !addMessageMutation.isPending) {
      addMessageMutation.mutate({
        ticketId: ticket.id,
        content: newMessage,
        creator: TicketCreator.USER,
      });
    }
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (ticket.status === 'resolved') return 100;
    if (ticket.status === 'in_progress') return 40;
    return 20; // Open status
  };
  
  // For mobile, only show if there's a ticket selected
  if (isMobile && !ticket) return null;
  
  // Only render on desktop screens or if explicitly shown on mobile
  if (isMobile) return null;
  
  return (
    <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Ticket #{ticket.ticketNumber}
        </h2>
        <p className="text-sm text-gray-500">
          Created on {new Date(ticket.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Status</h3>
          <TicketStatus status={ticket.status} />
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">
              {ticket.status === 'open' ? '1 of 5 steps' : 
               ticket.status === 'in_progress' ? '2 of 5 steps' : 
               '5 of 5 steps'}
            </span>
          </div>
          
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
            <div 
              style={{ width: `${getProgressPercentage()}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500">
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <div className="mt-0.5 mr-3 flex-shrink-0">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="h-5 w-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-primary-500 rounded-full"></div>
                  </div>
                  <div className="absolute h-full w-px bg-gray-300 top-5 left-2.5"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Ticket Created</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <CheckCircle className="text-success-500 h-5 w-5" />
            </div>
            
            <div className="flex items-start">
              <div className="mt-0.5 mr-3 flex-shrink-0">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className={`h-5 w-5 ${ticket.status === 'open' ? 'bg-gray-200' : 'bg-primary-100'} rounded-full flex items-center justify-center`}>
                    <div className={`h-2.5 w-2.5 ${ticket.status === 'open' ? 'bg-gray-400' : 'bg-primary-500'} rounded-full`}></div>
                  </div>
                  <div className="absolute h-full w-px bg-gray-300 top-5 left-2.5"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${ticket.status === 'open' ? 'text-gray-400' : 'text-gray-900'}`}>Assigned to Department</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ticket.status !== 'open' ? 
                    new Date(ticket.updatedAt).toLocaleString() : 
                    'Pending'}
                </p>
              </div>
              {ticket.status !== 'open' && <CheckCircle className="text-success-500 h-5 w-5" />}
            </div>
            
            <div className="flex items-start">
              <div className="mt-0.5 mr-3 flex-shrink-0">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className={`h-5 w-5 ${ticket.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                    <div className={`h-2.5 w-2.5 ${ticket.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'} rounded-full`}></div>
                  </div>
                  <div className="absolute h-full w-px bg-gray-300 top-5 left-2.5"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${ticket.status === 'in_progress' ? 'text-gray-900' : 'text-gray-400'}`}>Under Review</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ticket.status === 'in_progress' ? 'In progress' : 'Pending'}
                </p>
              </div>
              {ticket.status === 'in_progress' && <Timer className="text-yellow-500 h-5 w-5" />}
            </div>
            
            <div className="flex items-start">
              <div className="mt-0.5 mr-3 flex-shrink-0">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="h-5 w-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="absolute h-full w-px bg-gray-300 top-5 left-2.5"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-400">Solution Provided</h4>
                <p className="text-xs text-gray-400 mt-0.5">Pending</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-0.5 mr-3 flex-shrink-0">
                <div className="h-5 w-5 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="h-2.5 w-2.5 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-400">Resolved</h4>
                <p className="text-xs text-gray-400 mt-0.5">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Ticket Details</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subject</label>
            <p className="text-sm text-gray-800">{ticket.subject}</p>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Department</label>
            <div className="flex items-center">
              <i className="bx bx-dollar-circle text-secondary-500 mr-2"></i>
              <p className="text-sm text-gray-800">{ticket.department}</p>
            </div>
          </div>
          
          {ticket.assignedTo && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-800">{ticket.assignedTo}</p>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Priority</label>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                ticket.priority === 'high' ? 'bg-error-500' :
                ticket.priority === 'medium' ? 'bg-warning-500' :
                'bg-success-500'
              }`}></span>
              <p className="text-sm text-gray-800 capitalize">{ticket.priority}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Updates</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : data?.updates && data.updates.length > 0 ? (
          <div className="space-y-4">
            {data.updates.map((update: any) => (
              <div key={update.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {update.creator === TicketCreator.STAFF ? (
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>ST</AvatarFallback>
                      </Avatar>
                    ) : update.creator === TicketCreator.USER ? (
                      <User className="h-4 w-4 mr-2 text-primary-500" />
                    ) : (
                      <i className="bx bx-bot text-secondary-500 mr-2 text-lg"></i>
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {update.creator === TicketCreator.STAFF 
                        ? ticket.assignedTo || 'Staff Member'
                        : update.creator === TicketCreator.USER
                          ? 'You'
                          : 'System'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{update.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500 text-center">No updates yet</p>
          </div>
        )}
        
        <form onSubmit={handleSubmitMessage} className="mt-4 p-3 border border-dashed border-gray-300 rounded-md">
          <Textarea
            placeholder="Type your message here..."
            rows={2}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="mt-2 w-full text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
          />
          <div className="mt-2 flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary-500 hover:bg-primary-600"
              size="sm"
              disabled={!newMessage.trim() || addMessageMutation.isPending}
            >
              {addMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </aside>
  );
}
