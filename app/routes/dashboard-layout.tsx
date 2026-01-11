import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { fetchUserProfile, type UserProfile } from "../http/Auth";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Helper to get consistent field values (handling potential case differences)
  const getNickname = (u: UserProfile) => u.Nickname || u.nickname || "User";
  const getRoleName = (u: UserProfile) => {
      const roleKey = u.Role?.Key || u.role?.Key;
      switch(roleKey) {
          case "student": return "学生";
          case "counselor": return "辅导员";
          case "teacher": return "教师";
          case "admin": return "管理员";
          default: return u.Role?.Name || u.role?.Name || "用户";
      }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Fetch basic user info for the sidebar
    fetchUserProfile(token)
        .then(data => setUser(data))
        .catch(err => {
            console.error("Layout fetch user error:", err);
            // Optional: redirect to login if 401
        });

  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 center">
        <div className="p-4 border-b border-slate-700 m-0 center">
          <h2 className="text-xl font-bold center m-auto">Unihub Board</h2>
        </div>
        
        <nav className="flex-1 min-h-0 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                📊 数据大屏
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/organization" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                我的组织
              </NavLink>
            </li>
            <li>
                 <NavLink 
                    to="/class" 
                    className={({ isActive }) => 
                      `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                    }
                  >
                    📚 班级管理
                  </NavLink>
            </li>

            {/* Ding Management Dropdown */}
            <li>
                <details className="group">
                    <summary className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-slate-800 cursor-pointer select-none text-slate-200">
                        <span className="flex items-center gap-2">📍 打卡管理</span>
                        <span className="transform transition-transform text-xs group-open:rotate-180">▼</span>
                    </summary>
                    <ul className="pl-4 mt-1 space-y-1">
                        <li>
                            <NavLink 
                                to="/check-in" 
                                className={({ isActive }) => 
                                `block px-4 py-2 rounded-md text-sm ${isActive ? 'bg-indigo-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                                }
                            >
                                + 发布新打卡
                            </NavLink>
                        </li>
                         <li>
                            <NavLink 
                                to="/dings?view=normal" 
                                className={({ isActive, isPending }) => {
                                    // Custom active check for query params if needed, or rely on URL matching
                                    // Simple string includes check works for this specific structure
                                    const isNormal = location.pathname === '/dings' && location.search.includes('view=normal');
                                    return `block px-4 py-2 rounded-md text-sm ${isNormal ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                                }}
                            >
                                📋 常规任务列表
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/dings?view=return" 
                                className={({ isActive }) => {
                                    const isReturn = location.pathname === '/dings' && location.search.includes('view=return');
                                   return `block px-4 py-2 rounded-md text-sm ${isReturn ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                                }}
                            >
                                🔙 返校销假记录
                            </NavLink>
                        </li>
                    </ul>
                </details>
            </li>

            <li className="mt-4 pt-4 border-t border-slate-700">
              <NavLink 
                to="/leave-approval" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                📝 请假管理
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/check-in" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                📍 签到打卡
              </NavLink>
            </li>
            <li>
                <NavLink 
                    to="/dings" 
                    className={({ isActive }) => 
                    `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                    }
                >
                    📍 打卡任务
                </NavLink>
            </li>

            {/* Add Notification Link */}
            <li>
                <NavLink 
                    to="/notifications" 
                    className={({ isActive }) => 
                    `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                    }
                >
                    🔔 通知中心
                </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          
          {user && (
            <div className="mb-4 flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                    {getNickname(user).charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{getNickname(user)}</p>
                    <p className="text-xs text-slate-400 truncate">{getRoleName(user)}</p>
                </div>
            </div>
          )}

          <div className="space-y-1">
            <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 rounded-md text-sm ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
            >
                <span>👤</span>
                <span>我的信息</span>
            </NavLink>
            <button 
                onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-600/20 hover:text-red-400 text-slate-400 transition-colors text-sm text-left"
            >
                <span>🚪</span>
                <span>退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
