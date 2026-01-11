import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import QRCode from "react-qr-code"; // Ensure react-qr-code is installed
import { 
    fetchMyClasses, 
    fetchClassDetail, 
    createClass,
    type Class, 
    type Student 
} from "../http/Auth";

// Extend Class to hold UI state and student list locally
interface ClassWithState extends Class {
    isOpen: boolean;
    isLoading: boolean;
    students?: Student[];
}

export default function MyClass() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassWithState[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // QR Code State
  const [qrClass, setQrClass] = useState<{name: string, code: string} | null>(null);

  // Initial load: Fetch list of classes
  const loadClasses = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const data = await fetchMyClasses(token);
            // Initialize UI state
            const uiData = data.map(c => ({ 
                ...c, 
                isOpen: false, 
                isLoading: false,
             }));
            setClasses(uiData);
        } catch (error) {
            console.error("Failed to load classes", error);
        } finally {
            setLoading(false);
        }
  };

  useEffect(() => {
    loadClasses();
  }, [navigate]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token || !newClassName.trim()) return;

      setSubmitting(true);
      try {
          await createClass(token, newClassName);
          setIsModalOpen(false);
          setNewClassName("");
          await loadClasses();
          alert("班级创建成功！");
      } catch (error: any) {
          alert(`创建失败: ${error.message}`);
      } finally {
          setSubmitting(false);
      }
  };

  const toggleClass = async (classId: number) => {
    setClasses(prev => prev.map(c => {
        if (c.ID !== classId) return c;
        return { ...c, isOpen: !c.isOpen };
    }));

    const target = classes.find(c => c.ID === classId);
    if (!target) return;

    if (!target.isOpen && !target.students) {
        setClasses(prev => prev.map(c => c.ID === classId ? { ...c, isLoading: true } : c));
        
        try {
            const token = localStorage.getItem("token") || "";
            const detail = await fetchClassDetail(token, classId);
            
            setClasses(prev => prev.map(c => {
                if (c.ID !== classId) return c;
                return { 
                    ...c, 
                    isLoading: false, 
                    students: detail.students || [] 
                };
            }));
        } catch (error) {
            console.error(error);
            setClasses(prev => prev.map(c => c.ID === classId ? { ...c, isLoading: false } : c));
        }
    }
  };

  const getStudentName = (s: Student) => s.Nickname || s.nickname || "Unknown";
  const getStudentNo = (s: Student) => s.StudentNo || s.student_no || "-";

  if (loading) return <div className="p-6">加载班级信息中...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">我的班级 (教学管理)</h2>
        <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition shadow-sm flex items-center gap-1"
            onClick={() => setIsModalOpen(true)}
        >
            <span className="text-lg leading-none">+</span> 创建班级
        </button>
      </div>

      {classes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 text-gray-400">
              暂无管理的班级
          </div>
      ) : (
        <div className="grid gap-4">
            {classes.map((cls) => (
            <div 
                key={cls.ID} 
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 overflow-hidden ${cls.isOpen ? 'ring-2 ring-indigo-50 border-indigo-100' : 'border-gray-200'}`}
            >
                {/* Header (Summary) */}
                <div 
                    onClick={() => toggleClass(cls.ID)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-white select-none z-10 relative"
                >
                    <div className="flex flex-col">
                        <span className="text-lg font-medium text-gray-800">{cls.Name}</span>
                        <div className="flex items-center gap-4 mt-1">
                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                邀请码: <span className="font-mono font-bold text-indigo-600 select-all">{cls.InviteCode}</span>
                             </span>
                             <span className="text-xs text-gray-400">ID: {cls.ID}</span>
                        </div>
                    </div>
                   
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setQrClass({ name: cls.Name, code: cls.InviteCode });
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="显示班级二维码"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zm-6 12v-2m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> 
                                <path d="M10 10h.01M14 10h.01M10 14h.01M14 14h.01" strokeWidth={3}/> 
                            </svg>
                        </button>
                        <span className={`transform transition-transform duration-200 text-gray-400 ${cls.isOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </div>
                </div>

                {/* Dropdown Content */}
                {cls.isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                        {cls.isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-500">加载成员列表...</div>
                        ) : (
                            <div className="px-4 pb-4 pt-2">
                                {(!cls.students || cls.students.length === 0) ? (
                                    <div className="py-4 text-center text-sm text-gray-400">该班级暂无学生加入</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                            <tr className="border-b border-gray-200 text-gray-500">
                                                <th className="py-3 px-2 font-medium">学号</th>
                                                <th className="py-3 px-2 font-medium">姓名</th>
                                                <th className="py-3 px-2 font-medium">邮箱</th>
                                                <th className="py-3 px-2 font-medium text-right">操作</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {cls.students.map((student) => (
                                                <tr key={student.ID} className="border-b border-gray-100 hover:bg-white transition-colors">
                                                    <td className="py-3 px-2 font-mono text-gray-600">{getStudentNo(student)}</td>
                                                    <td className="py-3 px-2 font-medium text-gray-900">{getStudentName(student)}</td>
                                                    <td className="py-3 px-2 text-gray-500">{student.Email}</td>
                                                    <td className="py-3 px-2 text-right">
                                                        <button className="text-indigo-600 hover:text-indigo-800 text-xs">查看详情</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            ))}
        </div>
      )}

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">创建新班级</h3>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            班级名称
                        </label>
                        <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="例如：高等数学A班"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            autoFocus
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            创建后将自动生成8位邀请码，学生通过该码加入班级。
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {submitting ? "提交中..." : "立即创建"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

     {/* QR Code Modal for Class */}
      {qrClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setQrClass(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{qrClass.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">扫码加入班级</p>
                </div>
                
                <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCode 
                        value={JSON.stringify({
                            type: 'class', 
                            code: qrClass.code,
                            action: 'join_class' // Marker for mobile app logic
                        })} 
                        size={200}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                <div className="text-center mt-6">
                     <p className="text-indigo-600 font-mono font-bold text-xl tracking-wider">{qrClass.code}</p>
                     <p className="text-xs text-gray-400 mt-2">班级邀请码</p>
                </div>

                <button 
                    onClick={() => setQrClass(null)}
                    className="mt-6 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                    关闭
                </button>
            </div>
        </div>
      )}

    </div>
  );
}