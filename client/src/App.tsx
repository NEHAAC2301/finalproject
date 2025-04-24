import { useEffect, useState } from "react";
import { User } from "@shared/schema";

// Mock current user for development
const mockUser: User = {
  id: 1,
  username: "student",
  password: "", // Password is never sent to client
  fullName: "Emily Parker",
  studentId: "SP2023456",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format"
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    // In a real app, we would fetch the user data from the API
    // For now, we'll just use the mock user
    setCurrentUser(mockUser);
  }, []);
  
  if (!currentUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <header className="bg-primary-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Ammu</h1>
          <div className="flex items-center gap-2">
            <span>{currentUser.fullName}</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {currentUser.profileImage && (
                <img 
                  src={currentUser.profileImage} 
                  alt={currentUser.fullName} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 mt-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Ammu</h2>
          <p className="text-center mb-6">
            Hello, {currentUser.fullName}! I'm your university support assistant.
            How can I help you today?
          </p>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Chat with Ammu</div>
            <div className="border-b pb-4 mb-4">
              <div className="bg-primary-50 p-3 rounded-lg inline-block max-w-[80%] mb-2">
                Hi there! I'm Ammu, your university support assistant. How can I help you today?
              </div>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                Send
              </button>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div 
              className="bg-sky-50 p-4 rounded-lg shadow-sm border border-sky-100 hover:bg-sky-100 cursor-pointer"
            >
              <h3 className="font-semibold mb-1">View My Tickets</h3>
              <p className="text-sm text-gray-600">Check status of your support requests</p>
            </div>
            
            <div 
              className="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-100 hover:bg-amber-100 cursor-pointer"
            >
              <h3 className="font-semibold mb-1">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Browse helpful resources and FAQs</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
