export default function Profile() {
  const user = {
    name: "张小明",
    id: "2024001001",
    department: "计算机学院",
    role: "学生",
    email: "zhangxm@example.com",
    phone: "13800138000"
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">我的信息</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-indigo-600 h-32 flex items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white mt-16">
                 👤
            </div>
        </div>
        <div className="pt-12 pb-8 px-8">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-gray-500">{user.department} - {user.role}</p>
            </div>
            
            <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">学工号</span>
                    <span className="font-medium text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">邮箱</span>
                    <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">手机号</span>
                    <span className="font-medium text-gray-900">{user.phone}</span>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    编辑资料
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
