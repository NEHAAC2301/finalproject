import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message, Ticket } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

export function useChat(userId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>(uuidv4());
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/websocket`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = () => {
      setConnected(true);
      console.log("WebSocket connection established");
    };
    
    socketRef.current.onclose = () => {
      setConnected(false);
      console.log("WebSocket connection closed");
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        toast({
          title: "Connection lost",
          description: "Attempting to reconnect...",
          variant: "destructive",
        });
      }, 3000);
    };
    
    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      });
    };
    
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);
      
      switch (data.type) {
        case "message_received":
          // Message acknowledgement
          break;
          
        case "assistant_response":
          setLoading(false);
          setMessages((prev) => [...prev, data.message]);
          break;
          
        case "ticket_created":
          setCurrentTicket(data.ticket);
          toast({
            title: "Ticket Created",
            description: `Ticket #${data.ticket.ticketNumber} has been created and assigned to ${data.ticket.department}.`,
          });
          break;
          
        case "error":
          setLoading(false);
          toast({
            title: "Error",
            description: data.error || "An error occurred",
            variant: "destructive",
          });
          break;
      }
    };
    
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setMessages(data);
            // Get conversation ID from the latest message
            const latestMessage = data[data.length - 1];
            setConversationId(latestMessage.conversationId);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId, toast]);
  
  // Function to send message
  const sendMessage = (content: string) => {
    if (!connected) {
      toast({
        title: "Not connected",
        description: "Please wait for the connection to be established",
        variant: "destructive",
      });
      return;
    }
    
    const message = {
      id: Date.now(),
      userId,
      content,
      role: 'user',
      timestamp: new Date(),
      conversationId,
    };
    
    setMessages((prev) => [...prev, message]);
    setLoading(true);
    
    socketRef.current?.send(JSON.stringify({
      type: "message",
      userId,
      content,
      conversationId,
    }));
  };

  return {
    messages,
    conversationId,
    sendMessage,
    loading,
    connected,
    currentTicket,
  };
}
