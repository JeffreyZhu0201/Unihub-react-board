import { useNavigate, Link } from "react-router";
import { useState } from "react";
import { register, type RegisterPayload } from "../http/Auth";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "counselor" | "teacher">("student");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: RegisterPayload = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        nickname: formData.get("nickname") as string,
        role_key: role,
        student_no: formData.get("student_no") as string || undefined,
        staff_no: formData.get("staff_no") as string || undefined,
    };

    try {
        const response = await register(payload);
        if (response.token) {
            localStorage.setItem("token", response.token);
            alert("注册成功");
            navigate("/");
        }
    } catch (error: any) {
        console.error(error);
        alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">注册 UniHub</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="user@example.com"
            />
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名/昵称</label>
            <input 
              name="nickname"
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="请输入您的姓名"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select 
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
                <option value="student">学生</option>
                <option value="counselor">辅导员</option>
                <option value="teacher">教师</option>
            </select>
          </div>

          {/* Conditional ID Fields */}
          {role === "student" ? (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
                <input 
                  name="student_no"
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="2024001"
                />
            </div>
          ) : (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工号</label>
                <input 
                  name="staff_no"
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="T001"
                />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="请输入密码"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium mt-6"
          >
            注册并登录
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          已有账号？ <Link to="/login" className="text-indigo-600 hover:text-indigo-800">去登录</Link>
        </div>
      </div>
    </div>
  );
}
