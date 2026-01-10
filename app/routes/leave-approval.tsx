import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { fetchPendingLeaves, auditLeave, type LeaveRequest } from "../http/Auth";

export default function LeaveApproval() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadLeaves = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }
    try {
        setLoading(true);
        const data = await fetchPendingLeaves(token);
        // Ensure data is array (backend might return null for empty slice)
        setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to load leaves", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [navigate]);

  const handleAction = async (id: number, action: 'approved' | 'rejected') => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm(action === 'approved' ? "确认通过该请假申请？" : "确认驳回该请假申请？")) {
        return;
    }

    try {
        setProcessingId(id);
        await auditLeave(token, { leave_id: id, status: action });
        
        // Remove from list immediately upon success for better UX
        setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error: any) {
        console.error("Action failed", error);
        alert(`操作失败: ${error.message}`);
    } finally {
        setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString('zh-CN', {
       month: '2-digit',
       day: '2-digit',
       hour: '2-digit',
       minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📝 请假审批
        </h2>
        <button 
            onClick={loadLeaves}
            className="text-indigo-600 text-sm hover:underline flex items-center gap-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden ring-1 ring-black/5">
        {loading ? (
            <div className="p-12 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                <div>加载中...</div>
            </div>
        ) : requests.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                暂无待审批的请假申请
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原因</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间范围</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                                    {req.student_name ? req.student_name.charAt(0) : 'S'}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{req.student_name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">ID: {req.student_id}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                req.type === '病假' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {req.type}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={req.reason}>{req.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                            <div className="flex flex-col gap-1">
                                <span>起: {formatDate(req.start_time)}</span>
                                <span>止: {formatDate(req.end_time)}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {processingId === req.id ? (
                            <span className="text-gray-400 flex items-center gap-1">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                处理中
                            </span>
                        ) : (
                            <div className="flex space-x-2">
                            <button 
                                onClick={() => handleAction(req.id, 'approved')}
                                className="text-green-600 hover:text-white border border-green-600 hover:bg-green-600 px-3 py-1 rounded-md text-xs transition-colors duration-200"
                            >
                                同意
                            </button>
                            <button 
                                onClick={() => handleAction(req.id, 'rejected')}
                                className="text-red-600 hover:text-white border border-red-600 hover:bg-red-600 px-3 py-1 rounded-md text-xs transition-colors duration-200"
                            >
                                拒绝
                            </button>
                            </div>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
