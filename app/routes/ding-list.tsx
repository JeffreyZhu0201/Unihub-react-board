import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router"; // Add useSearchParams
import { 
    fetchMyCreatedDings, 
    fetchDingRecords, 
    type DingTask, 
    type DingRecord 
} from "../http/Auth";

interface DingTaskWithState extends DingTask {
    isOpen: boolean;
    isLoadingRecords: boolean;
    records?: DingRecord[];
}

export default function DingList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const viewType = searchParams.get("view") || "normal"; // 'normal' or 'return'

    const [dings, setDings] = useState<DingTaskWithState[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDings();
    }, [navigate, viewType]); // Reload when viewType changes

    const loadDings = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const data = await fetchMyCreatedDings(token);
            
            // Filter Logic based on viewType
            // 'leave_return' is the type we set in backend service
            // '返校签到' is for backward compatibility with existing data
            const filtered = data.filter(d => {
                const isReturn = d.Title == '返校签到';
                if (viewType === 'return') return isReturn;
                return !isReturn;
            });

            setDings(filtered.map(d => ({ 
                ...d, 
                isOpen: false, 
                isLoadingRecords: false 
            })));
        } catch (error) {
            console.error("Fetch dings error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDing = async (dingId: number) => {
        // Toggle open state
        setDings(prev => prev.map(d => {
            if (d.ID !== dingId) return d;
            return { ...d, isOpen: !d.isOpen };
        }));

        const target = dings.find(d => d.ID === dingId);
        if (target && !target.isOpen && !target.records) {
            setDings(prev => prev.map(d => d.ID === dingId ? { ...d, isLoadingRecords: true } : d));
            const token = localStorage.getItem("token") || "";
            try {
                const records = await fetchDingRecords(token, dingId);
                setDings(prev => prev.map(d => {
                    if (d.ID !== dingId) return d;
                    return { ...d, isLoadingRecords: false, records };
                }));
            } catch (err) {
                console.error("Fetch records error:", err);
                setDings(prev => prev.map(d => d.ID === dingId ? { ...d, isLoadingRecords: false } : d));
            }
        }
    };

    const formatDate = (str: string) => {
        if (!str) return "-";
        return new Date(str).toLocaleString('zh-CN', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "complete":
                return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">已完成</span>;
            case "late":
                return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">迟到</span>;
            default: 
                return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">未打卡</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {viewType === 'return' ? '🔙 返校销假记录' : '📍 常规打卡任务'}
                </h2>
                {viewType === 'normal' && (
                    <button
                        onClick={() => navigate("/check-in")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 shadow-sm flex items-center gap-1"
                    >
                        + 发起新打卡
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : dings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-100 text-gray-400">
                    {viewType === 'return' ? '暂无返校签到记录' : '暂无发布的打卡任务'}
                </div>
            ) : (
                <div className="space-y-4">
                    {dings.map(ding => (
                        <div key={ding.ID} className={`bg-white rounded-lg shadow-sm border transition-all ${ding.isOpen ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-gray-200'}`}>
                            {/* Card Header */}
                            <div 
                                onClick={() => toggleDing(ding.ID)}
                                className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center select-none"
                            >
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-medium text-gray-900">{ding.Title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${
                                            ding.Type === 'leave_return' 
                                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        }`}>
                                            {ding.Type === 'leave_return' ? '返校' : (ding.Type === 'dorm_check' ? '查寝' : '签到')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                        <span>截止: {formatDate(ding.Deadline)}</span>
                                        {ding.records && (
                                            <span className="text-gray-400">
                                                进度: {ding.records.filter(r => r.status === 'complete').length}/{ding.records.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {ding.isOpen ? '▲ 收起' : '▼ 详情'}
                                </div>
                            </div>

                            {/* Expanded Records List */}
                            {ding.isOpen && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                    {ding.isLoadingRecords ? (
                                        <div className="text-center text-sm text-gray-500 py-2">正在获取打卡记录...</div>
                                    ) : !ding.records || ding.records.length === 0 ? (
                                        <div className="text-center text-sm text-gray-400 py-2">暂无学生需要打卡</div>
                                    ) : (
                                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-medium text-gray-500">姓名</th>
                                                        <th className="px-4 py-2 text-left font-medium text-gray-500">学号</th>
                                                        <th className="px-4 py-2 text-left font-medium text-gray-500">状态</th>
                                                        <th className="px-4 py-2 text-left font-medium text-gray-500">打卡时间</th>
                                                        <th className="px-4 py-2 text-left font-medium text-gray-500">位置/备注</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {ding.records.map(record => (
                                                        <tr key={`${ding.ID}-${record.student_id}`} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 font-medium text-gray-900">{record.student_name || '未知'}</td>
                                                            <td className="px-4 py-2 text-gray-500 font-mono">{record.student_no}</td>
                                                            <td className="px-4 py-2">{getStatusBadge(record.status)}</td>
                                                            <td className="px-4 py-2 text-gray-500">{record.ding_time ? formatDate(record.ding_time) : '-'}</td>
                                                            <td className="px-4 py-2 text-gray-500 truncate max-w-xs">{record.location || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}