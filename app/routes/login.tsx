import { useNavigate, Link } from "react-router";
import { useAlert } from "../components/GlobalAlert";
import {login,type LoginPayload} from "../http/Auth";

export default function Login() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Email:", email);
    console.log("Password:", password);
    if (email === "" || password === "") {
        showAlert("登录失败", "用户名和密码不能为空", "error");
        return;
    }
    const payload: LoginPayload = {
      email: email,
      password: password,
    };
    
    try {
        const response = await login(payload);
        // Backend returns { "token": "..." }
        if (!response?.token) {
            showAlert("登录失败", "服务器未返回Token", "error");
            return;
        }
        
        localStorage.setItem("token", response.token);
        showAlert("登录成功", "欢迎回来！", "success");
        setTimeout(() => navigate("/"), 500);
        
    } catch (error: any) {
        showAlert("登录失败", error.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Unihub-登录</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input 
              name="email"
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="请输入用户名"
            />
          </div>
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
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            登录
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          还没有账号？ <Link to="/register" className="text-indigo-600 hover:text-indigo-800">去注册</Link>
        </div>
      </div>
    </div>
  );
}
