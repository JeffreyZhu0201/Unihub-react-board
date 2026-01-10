import { Form, useLoaderData } from "react-router"; // Reverted imports
import type { Route } from "./+types/leaves";

// ...existing code...

interface LeaveRequest {
  id: string;
  student?: {
    name: string;
    student_id: string;
  };
  type: number;
  start_time: string;
  end_time: string;
  reason: string;
  status: number;
}

// ...existing code...

export default function LeaveManagement({ loaderData }: Route.ComponentProps) {
  const { leaves } = loaderData;
  // Reverted: fetcher usage removed

  // ...existing code...

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Invalid Date";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString();
  };

  const getTypeLabel = (type: number) => {
    const map: Record<number, string> = { 1: "Sick Leave", 2: "Personal Leave" };
    return map[type] || "Other";
  };

  return (
    <div className="p-6">
      {/* ...existing code... */}
      <tbody className="divide-y divide-gray-200 bg-white">
        {leaves.map((leave: LeaveRequest) => (
          <tr key={leave.id}>
            {/* ...existing code... */}
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
               {leave.status === 0 ? (
                  <div className="flex space-x-2">
                    {/* Reverted to simple button placeholders */}
                    <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => console.log("Approve", leave.id)}
                    >
                        通过
                    </button>
                    <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => console.log("Reject", leave.id)}
                    >
                        驳回
                    </button>
                  </div>
               ) : (
                 <span className={leave.status === 1 ? "text-green-600" : "text-red-600"}>
                    {leave.status === 1 ? "已通过" : "已驳回"}
                 </span>
               )}
            </td>
          </tr>
        ))}
      </tbody>
      {/* ...existing code... */}
    </div>
  );
}
