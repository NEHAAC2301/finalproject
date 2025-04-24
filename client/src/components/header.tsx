import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <div className="h-10 w-10 bg-primary-100 rounded-md flex items-center justify-center mr-3">
          <span className="text-primary-700 font-semibold text-lg">U</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">UniAssist</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="text-right mr-3">
            <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
            <p className="text-xs text-gray-500">ID: {user.studentId}</p>
          </div>
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.profileImage} alt={user.fullName} />
              <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success-500 ring-2 ring-white"></span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <BellIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
