import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
    createNotification, 
    fetchMyDepartments, 
    fetchMyClasses, 
    fetchUserProfile,
    type Department, 
    type Class
} from "../http/Auth";

interface TargetItem {
    id: number;
    name: string;
    type: 'dept' | 'class';
    uniqueKey: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // 同时尝试获取部门和班级（用户可能只有一种身份，也可能两种都有）
            const loadedTargets: TargetItem[] = [];

            // 尝试获取部门 (Counselor)
            try {
                const depts = await fetchMyDepartments(token);
                depts.forEach(d => loadedTargets.push({
                    id: d.ID,
                    name: d.Name,
                    type: 'dept',
                    uniqueKey: `dept-${d.ID}`
                }));
            } catch (e) { /* 忽略权限错误或空列表 */ }

            // 尝试获取班级 (Teacher)
            try {
                const classes = await fetchMyClasses(token);
                classes.forEach(c => loadedTargets.push({
                    id: c.ID,
                    name: c.Name,
                    type: 'class',
                    uniqueKey: `class-${c.ID}`
                }));
            } catch (e) { /* 忽略权限错误或空列表 */ }

            setTargets(loadedTargets);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [navigate]);

  const toggleSelection = (key: string) => {
      const newSet = new Set(selectedKeys);
      if (newSet.has(key)) {
          newSet.delete(key);
      } else {
          newSet.add(key);
      }
      setSelectedKeys(newSet);
  };

  const selectAll = () => {
      if (selectedKeys.size === targets.length) {
          setSelectedKeys(new Set());
      } else {
          setSelectedKeys(new Set(targets.map(t => t.uniqueKey)));
      }
  };

  const handleSubmit = async () => {
    if (!title || !content || selectedKeys.size === 0) {
      alert("请填写完整标题、内容并至少选择一个发送对象");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    try {
        // 由于后端接口每次只能发送给一个对象，这里进行循环发送
        const promises = Array.from(selectedKeys).map(key => {
            const target = targets.find(t => t.uniqueKey === key);
            if (!target) return Promise.resolve();
            return createNotification(token, {
                title,
                content,
                target_type: target.type,
                target_id: target.id
            });
        });

        await Promise.all(promises);
        
        alert(`成功发送 ${selectedKeys.size} 条通知！`);
        // 清空表单
        setTitle("");
        setContent("");
        // 保留选择或清空选择？通常清空避免误操作
        setSelectedKeys(new Set());
    } catch (error: any) {
        alert("部分通知发送失败: " + error.message);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">✉️ 发送通知</h2>
            <p className="text-sm text-gray-500 mt-1">支持向多个班级或部门批量发送</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Col: Target Select List */}
        <div className="lg:col-span-1 bg-white flex flex-col rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700">接收对象 ({targets.length})</label>
                <button 
                    onClick={selectAll}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                    {selectedKeys.size === targets.length && targets.length > 0 ? '取消全选' : '全选'}
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {targets.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <span className="text-2xl mb-2">📭</span>
                        <p className="text-sm">暂无管理的部门或班级</p>
                    </div>
                )}
                
                {targets.map(t => (
                    <div 
                        key={t.uniqueKey}
                        onClick={() => toggleSelection(t.uniqueKey)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group select-none ${
                            selectedKeys.has(t.uniqueKey)
                            ? 'bg-indigo-50 border-indigo-500 shadow-sm z-10' 
                            : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex flex-col overflow-hidden mr-3">
                            <span className={`text-sm font-semibold truncate transition-colors ${selectedKeys.has(t.uniqueKey) ? 'text-indigo-900' : 'text-gray-700'}`}>
                                {t.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    t.type === 'dept' 
                                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                    {t.type === 'dept' ? '部门' : '班级'}
                                </span>
                                <span className="text-[10px] text-gray-400">ID: {t.id}</span>
                            </div>
                        </div>
                        
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            selectedKeys.has(t.uniqueKey) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                        }`}>
                            {selectedKeys.has(t.uniqueKey) && (
                                <svg className="w-3 h-3 text-white" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                ))}
             </div>
             <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
                已选中 <span className="font-bold text-indigo-600 text-sm mx-1">{selectedKeys.size}</span> 个对象
             </div>
        </div>

        {/* Right Col: Content Input */}
        <div className="lg:col-span-2 flex flex-col h-full space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
                {/* Title Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">通知标题 <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="例如：关于本周五班会的通知"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                    />
                </div>

                {/* Content Input */}
                <div className="flex-1 flex flex-col min-h-0">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">通知内容 <span className="text-red-500">*</span></label>
                    <textarea 
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="请输入详细的通知内容，支持换行..."
                        className="w-full h-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none placeholder-gray-400"
                        style={{ minHeight: '200px' }}
                    />
                </div>
            </div>

            {/* Submit Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    即将向 <span className="font-bold text-gray-900">{selectedKeys.size}</span> 个群体发送通知
                </span>
                <button 
                    onClick={handleSubmit}
                    disabled={submitting || selectedKeys.size === 0}
                    className={`px-8 py-3 rounded-lg text-white font-bold shadow-md transition-all flex items-center gap-2 transform active:scale-95 ${
                        submitting || selectedKeys.size === 0
                        ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                    }`}
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            发送中...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            确认发送
                        </>
                    )}
                </button>
            </div>
         </div>
  </div>
</div>);
}