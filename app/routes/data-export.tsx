import { useState } from "react";
import { useNavigate } from "react-router";
import { 
    fetchMyCreatedDings, 
    fetchDingRecords, 
    exportDataToExcel,
    API_BASE_URL
} from "../http/Auth";

import { useAlert } from "../components/GlobalAlert"; // Assuming you have this or standard alert

interface FlatRecord {
    task_title: string;
    task_type: string;
    task_date: string;
    student_name: string;
    student_no: string;
    status: string;
    check_in_time: string;
    location: string;
}

export default function DataExport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [records, setRecords] = useState<FlatRecord[]>([]);
    
    // Filter State
    const [useDateRange, setUseDateRange] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleQuery = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (useDateRange && (!startDate || !endDate)) {
            alert("请选择开始和结束时间");
            return;
        }

        setLoading(true);
        setRecords([]);

        try {
            // 1. Get all tasks created by me
            const allDings = await fetchMyCreatedDings(token);

            // 2. Filter tasks by time
            const filteredDings = allDings.filter(ding => {
                if (!useDateRange) return true;
                const dingTime = new Date(ding.StartTime).getTime();
                const start = new Date(startDate).getTime();
                const end = new Date(endDate).getTime() + 86400000; // Include the end day
                return dingTime >= start && dingTime < end;
            });

            // 3. Fetch records for each task concurrently
            const recordPromises = filteredDings.map(async (ding) => {
                try {
                    const recs = await fetchDingRecords(token, ding.ID);
                    // Map to flat structure
                    return recs.map(r => ({
                        task_title: ding.Title,
                        task_type: ding.Type === 'dorm_check' ? '查寝' : (ding.Type === 'leave_return' ? '返校' : '签到'),
                        task_date: new Date(ding.StartTime).toLocaleDateString(),
                        student_name: r.student_name,
                        student_no: r.student_no,
                        status: r.status === 'complete' ? '已完成' : (r.status === 'late' ? '迟到' : '未完成'),
                        check_in_time: r.ding_time ? new Date(r.ding_time).toLocaleString() : '-',
                        location: r.location || '-'
                    }));
                } catch (e) {
                    console.error(`Failed to load records for ding ${ding.ID}`, e);
                    return [];
                }
            });

            const results = await Promise.all(recordPromises);
            const flatData = results.flat();
            setRecords(flatData);

            if (flatData.length === 0) {
                alert("该时间段内无数据");
            }

        } catch (error: any) {
            console.error(error);
            alert("查询失败: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const token = localStorage.getItem("token");
        if (!token || records.length === 0) return;

        setExporting(true);
        try {
            // Prepare data for backend (keys will be headers)
            // Rename keys to Chinese for better Excel headers
            const exportPayload = records.map(r => ({
                "任务标题": r.task_title,
                "任务类型": r.task_type,
                "发布日期": r.task_date,
                "学生姓名": r.student_name,
                "学号": r.student_no,
                "打卡状态": r.status,
                "打卡时间": r.check_in_time,
                "位置/备注": r.location
            }));

            const relativePath = await exportDataToExcel(token, exportPayload);
            
            // Construct absolute URL
            // Backend returns relative path like "resources/Export/Sheet1_123.xlsx"
            // Backend static handler is at /api/v1/resources, and API_BASE_URL ends with /api/v1
            // So we can just append the relative path.
            const downloadUrl = `${API_BASE_URL}/${relativePath}`;

            // Open in new window to trigger download
            window.open(downloadUrl, '_blank');

        } catch (error: any) {
            alert("导出失败: " + error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">📊 数据导出</h2>
                    <p className="text-sm text-gray-500 mt-1">查询并导出学生打卡记录统计</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-end gap-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={!useDateRange}
                                onChange={() => setUseDateRange(!useDateRange)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            查询全部历史数据
                        </label>
                    </div>

                    <div className={`flex items-center gap-4 transition-opacity ${!useDateRange ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">开始日期</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="pt-5 text-gray-400">→</div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">结束日期</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1"></div>

                    <button 
                        onClick={handleQuery}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? '查询中...' : '🔍 查询数据'}
                    </button>
                </div>
            </div>

            {/* Result Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">查询结果 ({records.length})</h3>
                    {records.length > 0 && (
                        <button 
                            onClick={handleExport}
                            disabled={exporting}
                            className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
                        >
                            {exporting ? '生成中...' : '📥 导出 Excel'}
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            加载数据中...
                        </div>
                    ) : records.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                             <div className="text-4xl text-gray-200">📊</div>
                             <p>暂无数据，请选择条件后点击查询</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">学生姓名</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">学号</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">任务标题</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">类型</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">发布日期</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">状态</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider">打卡时间</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {records.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">{r.student_name || '未知'}</td>
                                        <td className="px-6 py-3 text-gray-500 font-mono">{r.student_no}</td>
                                        <td className="px-6 py-3 text-gray-700">{r.task_title}</td>
                                        <td className="px-6 py-3 text-gray-500">{r.task_type}</td>
                                        <td className="px-6 py-3 text-gray-500">{r.task_date}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs ${
                                                r.status === '已完成' ? 'bg-green-100 text-green-700' : 
                                                r.status === '迟到' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">{r.check_in_time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}