import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">待处理审批</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
          <button 
             onClick={() => navigate("/leave-approval")}
             className="text-indigo-600 text-sm mt-4 hover:underline"
          >
            查看详情 &rarr;
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">本周打卡</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">5/7</p>
           <button 
             onClick={() => navigate("/check-in")}
             className="text-indigo-600 text-sm mt-4 hover:underline"
          >
            去打卡 &rarr;
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">我的班级</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
           <button 
             onClick={() => navigate("/class")}
             className="text-indigo-600 text-sm mt-4 hover:underline"
          >
            查看班级 &rarr;
          </button>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">最新通知</h3>
          <ul className="space-y-3">
             <li className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                 <span className="text-gray-700">学校将于本周五进行系统维护</span>
                 <span className="text-gray-500">2024-01-09</span>
             </li>
             <li className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                 <span className="text-gray-700">关于开展2024春季运动会的通知</span>
                 <span className="text-gray-500">2024-01-08</span>
             </li>
             <li className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                 <span className="text-gray-700">请各班级统计寒假留校人数</span>
                 <span className="text-gray-500">2024-01-07</span>
             </li>
          </ul>
       </div>
    </div>
  );
}
