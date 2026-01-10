import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchUserProfile, type UserProfile } from "../http/Auth";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const data = await fetchUserProfile(token);
            setUser(data);
        } catch (error) {
            console.error(error);
            // Handle error (e.g. token expired)
        } finally {
            setLoading(false);
        }
    };
    loadProfile();
  }, [navigate]);

  if (loading) return <div className="p-8">加载中...</div>;
  if (!user) return <div className="p-8">无法获取用户信息</div>;

  // Standardization helpers
  const nickname = user.Nickname || user.nickname;
  const email = user.Email || user.email;
  const roleKey = user.Role?.Key || user.role?.Key;
  const roleName = user.Role?.Name || user.role?.Name;
  const studentNo = user.StudentNo || user.student_no;
  const staffNo = user.StaffNo || user.staff_no;
  // Specific ID display
  const identityId = studentNo || staffNo || user.ID.toString();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">我的信息</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-indigo-600 h-32 flex items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white mt-16 text-gray-400">
                 {nickname?.[0]?.toUpperCase() || "U"}
            </div>
        </div>
        <div className="pt-12 pb-8 px-8">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{nickname}</h3>
                <p className="text-gray-500">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                        {roleName}
                    </span>
                    {/* Department info requires extra call or logic, omitted for now if not in profile response */}
                </p>
            </div>
            
            <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">
                        {roleKey === 'student' ? '学号' : (roleKey === 'teacher' || roleKey === 'counselor' ? '工号' : '用户ID')}
                    </span>
                    <span className="font-medium text-gray-900">{identityId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">邮箱</span>
                    <span className="font-medium text-gray-900">{email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">系统ID</span>
                    <span className="font-medium text-gray-900">{user.ID}</span>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-colors duration-200">
                    编辑资料
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
