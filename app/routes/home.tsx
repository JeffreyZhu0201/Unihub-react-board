import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { 
    fetchDashboardStats, 
    fetchDingStats, // Import new function
    type DashboardStats,
    type DingStats // Import new type
} from "../http/Auth";

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dingStats, setDingStats] = useState<DingStats | null>(null); // State for Ding Stats
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            // Check role first? If student, maybe skip stats or backend handles it (returns 0)
            const [leaveData, dingData] = await Promise.all([
                fetchDashboardStats(token).catch(() => null), 
                fetchDingStats(token).catch(() => null)
            ]);
            
            setStats(leaveData);
            setDingStats(dingData);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [navigate]);

  if (loading) return <div className="p-6">Loading...</div>;

  // Safe checks for array length (Leave Stats)
  const approvedCount = stats?.approved?.length || 0;
  const returnedCount = stats?.returned?.length || 0;
  const lateCount = stats?.late_returned?.length || 0;
  const leavingCount = stats?.leaving?.length || 0;

  // Ding Stats
  const dTotal = dingStats?.total_count || 0;
  const dDone = dingStats?.checked_count || 0;
  const dMissed = dingStats?.missed_count || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">数据总览</h2>
      
      {/* 1. Ding Stats Row (New) */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">日常打卡统计 (除去销假签到)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-indigo-800 text-sm font-medium">任务总人次</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{dTotal}</p>
                </div>
                <div className="mt-2 text-xs text-indigo-400">理论应打卡总数</div>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-emerald-800 text-sm font-medium">已打卡</h3>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{dDone}</p>
                </div>
                <div className="mt-2 text-xs text-emerald-400">实际完成数</div>
            </div>

            <div className="bg-rose-50 p-6 rounded-lg border border-rose-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-rose-800 text-sm font-medium">未打卡</h3>
                    <p className="text-3xl font-bold text-rose-600 mt-2">{dMissed}</p>
                </div>
                <div className="mt-2 text-xs text-rose-400">缺勤/未完成</div>
            </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-2"></div>

      {/* 2. Leave Stats Row (Existing) */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">请假情况统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Approved Leaves */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">总请假人数</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{approvedCount}</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">本学期累计</div>
            </div>

            {/* Returned */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">已回校</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{returnedCount}</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">正常销假</div>
            </div>

            {/* Not Returned (Leaving) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">未回校</h3>
                <p className="text-3xl font-bold text-orange-500 mt-2">{leavingCount}</p>
            </div>
            <button 
                onClick={() => navigate("/leave-approval")}
                className="text-left text-indigo-600 text-xs mt-4 hover:underline"
            >
                查看详情 &rarr;
            </button>
            </div>

            {/* Late Returned */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">晚归人数</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{lateCount}</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">需关注</div>
            </div>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">快捷操作</h3>
              <div className="flex gap-4">
                <button 
                    onClick={() => navigate("/check-in")}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition"
                >
                    发起打卡
                </button>
                <button 
                    onClick={() => navigate("/leave-approval")}
                    className="px-4 py-2 bg-amber-50 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-100 transition"
                >
                    请假审批
                </button>
              </div>
            </div>
      </div>
    </div>
  );
}
