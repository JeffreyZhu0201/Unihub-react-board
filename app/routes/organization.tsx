import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAlert } from "../components/GlobalAlert";
import { 
    fetchMyDepartments, 
    fetchDepartmentDetail, 
    createDepartment, // Import the new function
    type Department, 
    type Student 
} from "../http/Auth";

// Extend Department to hold UI state and student list locally
interface DepartmentWithState extends Department {
    isOpen: boolean;
    isLoading: boolean;
    students?: Student[]; // Loaded on demand
}

export default function Organization() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentWithState[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initial load: Fetch list of departments
  const loadDepts = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const data = await fetchMyDepartments(token);
            // Initialize UI state
            const uiData = data.map(d => ({ 
                ...d, 
                isOpen: false, 
                isLoading: false,
                // Preserve existing students if we are purely reloading list, but simple reload is fine here
             }));
            setDepartments(uiData);
        } catch (error) {
            console.error("Failed to load departments", error);
        } finally {
            setLoading(false);
        }
  };

  useEffect(() => {
    loadDepts();
  }, [navigate]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token || !newDeptName.trim()) return;

      setSubmitting(true);
      try {
          await createDepartment(token, newDeptName);
          setIsModalOpen(false);
          setNewDeptName("");
          // Refresh the list to show the new department
          await loadDepts();
          showAlert("创建部门成功", "已生成8位邀请码，根据需要分享给成员", "success");
          //alert("部门创建成功！");
      } catch (error: any) {
          showAlert(`创建失败: ${error.message}`, "", "error");
      } finally {
          setSubmitting(false);
      }
  };

  // Handle expand/collapse logic
  const toggleDepartment = async (deptId: number) => {
    setDepartments(prev => prev.map(d => {
        if (d.ID !== deptId) return d;
        return { ...d, isOpen: !d.isOpen };
    }));

    const target = departments.find(d => d.ID === deptId);
    if (!target) return;

    // If opening and students not loaded yet, fetch them
    if (!target.isOpen && !target.students) {
        setDepartments(prev => prev.map(d => d.ID === deptId ? { ...d, isLoading: true } : d));
        
        try {
            const token = localStorage.getItem("token") || "";
            const detail = await fetchDepartmentDetail(token, deptId);
            
            setDepartments(prev => prev.map(d => {
                if (d.ID !== deptId) return d;
                return { 
                    ...d, 
                    isLoading: false, 
                    students: detail.students || [] // Backend returns { students: [] }
                };
            }));
        } catch (error) {
            console.error(error);
            setDepartments(prev => prev.map(d => d.ID === deptId ? { ...d, isLoading: false } : d));
        }
    }
  };

  // Helper to handle casing differences
  const getStudentName = (s: Student) => s.Nickname || s.nickname || "Unknown";
  const getStudentNo = (s: Student) => s.StudentNo || s.student_no || "-";

  if (loading) return <div className="p-6">加载组织信息中...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">我的组织 (部门管理)</h2>
        <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition shadow-sm flex items-center gap-1"
            onClick={() => setIsModalOpen(true)}
        >
            <span className="text-lg leading-none">+</span> 创建部门
        </button>
      </div>

      {departments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 text-gray-400">
              暂无管理的部门
          </div>
      ) : (
        <div className="grid gap-4">
            {departments.map((dept) => (
            <div 
                key={dept.ID} 
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 overflow-hidden ${dept.isOpen ? 'ring-2 ring-indigo-50 border-indigo-100' : 'border-gray-200'}`}
            >
                {/* Header (Summary) */}
                <div 
                    onClick={() => toggleDepartment(dept.ID)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-white select-none z-10 relative"
                >
                    <div className="flex flex-col">
                        <span className="text-lg font-medium text-gray-800">{dept.Name}</span>
                        <div className="flex items-center gap-4 mt-1">
                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                邀请码: <span className="font-mono font-bold text-indigo-600 select-all">{dept.InviteCode}</span>
                             </span>
                             <span className="text-xs text-gray-400">ID: {dept.ID}</span>
                        </div>
                    </div>
                   
                    <span className={`transform transition-transform duration-200 text-gray-400 ${dept.isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>

                {/* Dropdown Content */}
                {dept.isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                        {dept.isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-500">加载成员列表...</div>
                        ) : (
                            <div className="px-4 pb-4 pt-2">
                                {(!dept.students || dept.students.length === 0) ? (
                                    <div className="py-4 text-center text-sm text-gray-400">该部门暂无学生加入</div>
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
                                            {dept.students.map((student) => (
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

      {/* Create Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">创建新部门</h3>
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
                            部门名称
                        </label>
                        <input
                            type="text"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            placeholder="例如：计算机科学与技术2024级1班"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            autoFocus
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            创建后将自动生成8位邀请码，学生通过该码加入部门。
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
                            {submitting && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {submitting ? "提交中..." : "立即创建"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
