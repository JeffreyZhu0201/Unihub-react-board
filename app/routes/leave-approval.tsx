import { useState } from "react";

export default function LeaveApproval() {
  const [requests, setRequests] = useState([
    { id: 1, student: "张三", reason: "病假", dates: "2024-01-10 ~ 2024-01-12", status: "pending" },
    { id: 2, student: "李四", reason: "事假", dates: "2024-01-15", status: "pending" },
    { id: 3, student: "王五", reason: "外出实习", dates: "2024-02-01 ~ 2024-03-01", status: "approved" },
  ]);

  const handleAction = (id: number, action: 'approved' | 'rejected') => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: action } : req
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">请假审批</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原因</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap">{req.student}</td>
                <td className="px-6 py-4">{req.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.dates}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {req.status === 'pending' && (
                    <div className="flex space-x-2">
                       <button 
                        onClick={() => handleAction(req.id, 'approved')}
                        className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded hover:bg-green-50"
                      >
                        同意
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                      >
                        拒绝
                      </button>
                    </div>
                  )}
                  {req.status !== 'pending' && <span className="text-gray-400">已处理</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
