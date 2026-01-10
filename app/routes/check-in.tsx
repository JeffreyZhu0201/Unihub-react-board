import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
    createDing, 
    fetchMyDepartments, 
    fetchMyClasses, 
    fetchUserProfile,
    type Department, 
    type Class,
    type CreateDingPayload
} from "../http/Auth";

export default function CheckIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data for selection
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [roleKey, setRoleKey] = useState<string>("");

  // Form State
  const [title, setTitle] = useState("");
  const [targetId, setTargetId] = useState<string>(""); // ID kept as string for select input
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState(""); 
  
  // Configuration
  const [enableLocation, setEnableLocation] = useState(false);
  // Default Hangzhou coordinates as placeholder
  const [latitude, setLatitude] = useState<number>(30.298);
  const [longitude, setLongitude] = useState<number>(120.158);
  const [radius, setRadius] = useState<number>(200);

  useEffect(() => {
    const init = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // 1. Get User Role
            const user = await fetchUserProfile(token);
            const key = user.Role?.Key || "student";
            setRoleKey(key);

            // 2. Fetch accessible targets based on role
            if (key === "counselor") {
                const depts = await fetchMyDepartments(token);
                setDepartments(depts);
                if (depts.length > 0) setTargetId(depts[0].ID.toString());
            } else if (key === "teacher") {
                const cls = await fetchMyClasses(token);
                setClasses(cls);
                if (cls.length > 0) setTargetId(cls[0].ID.toString());
            } else {
                alert("当前账号无权限发布打卡任务");
                navigate("/");
            }
            
            // Set default times (Current time & +1 hour)
            const now = new Date();
            const formatLocal = (d: Date) => {
                const pad = (n: number) => n < 10 ? '0' + n : n;
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };
            
            setStartTime(formatLocal(now));
            const later = new Date(now.getTime() + 60 * 60 * 1000); 
            setEndTime(formatLocal(later));

        } catch (error) {
            console.error(error);
            alert("加载数据失败，请重试");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!title || !targetId || !startTime || !endTime) {
      alert("请填写完整信息");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    try {
        // Construct basic payload
        const payload: CreateDingPayload = {
            title: title + (description ? ` (${description})` : ""),
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            // Backend strictly requires these numbers. Using 200/50 as defaults when disabled to pass non-zero validation if needed.
            latitude: enableLocation ? latitude : 200,
            longitude: enableLocation ? longitude : 200,
            radius: enableLocation ? radius : 50,
            type: "check_in", 
        };

        // Attach strict ID based on role logic locally logic
        if (roleKey === "counselor") {
            payload.dept_id = parseInt(targetId);
        } else if (roleKey === "teacher") {
            payload.class_id = parseInt(targetId);
        }

        await createDing(token, payload);
        alert("打卡任务发布成功！");
        navigate("/dings?view=normal"); 
    } catch (error: any) {
        alert("发布失败: " + error.message);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">发起打卡</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            身份: {roleKey === 'counselor' ? '辅导员' : '教师'}
        </span>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        {/* Target Selection */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                发布对象 <span className="text-red-500">*</span>
            </label>
            <select 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
                {roleKey === "counselor" ? (
                    departments.map(d => (
                        <option key={d.ID} value={d.ID}>{d.Name} (ID: {d.ID})</option>
                    ))
                ) : (
                    classes.map(c => (
                        <option key={c.ID} value={c.ID}>{c.Name} (ID: {c.ID})</option>
                    ))
                )}
                {((roleKey === "counselor" && departments.length === 0) || 
                  (roleKey === "teacher" && classes.length === 0)) && (
                   <option disabled>无可用发布对象</option>
                )}
            </select>
            <p className="text-xs text-gray-400 mt-1">
                {roleKey === 'counselor' ? '根据部门下发' : '根据班级下发'}
            </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">打卡主题 <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="例如：早操打卡、晚点名"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 <span className="text-red-500">*</span></label>
                    <input 
                        type="datetime-local" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">截止时间 <span className="text-red-500">*</span></label>
                    <input 
                        type="datetime-local" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">补充说明 (可选)</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24"
                    placeholder="输入具体要求将拼接在标题后..."
                ></textarea>
            </div>
        </div>
        
        {/* Location Config */}
        <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center space-x-2 mb-4">
                <input 
                    type="checkbox" 
                    id="location" 
                    checked={enableLocation}
                    onChange={(e) => setEnableLocation(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="location" className="text-gray-700 font-medium select-none cursor-pointer">开启位置限制</label>
            </div>

            {enableLocation ? (
                 <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">纬度 (Latitude)</label>
                        <input type="number" value={latitude} onChange={(e) => setLatitude(parseFloat(e.target.value))} className="w-full px-3 py-1 border rounded text-sm bg-white"/>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">经度 (Longitude)</label>
                        <input type="number" value={longitude} onChange={(e) => setLongitude(parseFloat(e.target.value))} className="w-full px-3 py-1 border rounded text-sm bg-white"/>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">允许半径 (米)</label>
                        <input type="number" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="w-full px-3 py-1 border rounded text-sm bg-white"/>
                    </div>
                    <div className="col-span-3 text-xs text-gray-500">
                        * 由于网页端无法精准获取GPS坐标，请手动填入目标地点坐标。
                    </div>
                 </div>
            ) : (
                <p className="text-xs text-gray-400 pl-6">未开启位置限制，学生可在任意地点打卡。</p>
            )}
        </div>

        {/* Submit */}
        <div className="pt-2">
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={submitting || !targetId}
              className={`w-full py-2.5 px-4 rounded-md transition-all text-white font-medium shadow-sm
                  ${submitting ? 'bg-indigo-400 cursor-wait' : 
                    (!targetId ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md')}
              `}
            >
              {submitting ? "任务发布中..." : "立即发布打卡任务"}
            </button>
            {!targetId && <p className="text-center text-xs text-red-500 mt-2">请先选择发布对象（若无选项请先在【组织管理】中创建）</p>}
        </div>
      </div>
    </div>
  );
}
