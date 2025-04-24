import { TicketStatus as TicketStatusEnum } from "@shared/schema";

interface TicketStatusProps {
  status: string;
}

export default function TicketStatus({ status }: TicketStatusProps) {
  let bgColor = "";
  let textColor = "";
  let label = "";
  
  switch (status) {
    case TicketStatusEnum.OPEN:
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Open";
      break;
    case TicketStatusEnum.IN_PROGRESS:
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "In Progress";
      break;
    case TicketStatusEnum.RESOLVED:
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Resolved";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      label = status;
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium ${bgColor} ${textColor} rounded-full`}>
      {label}
    </span>
  );
}
