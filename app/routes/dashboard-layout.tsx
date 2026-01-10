import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//     }
//   }, [location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">Unihub Board</h2>
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
                主页看板
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
                我的班级
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/leave-approval" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                请假审批
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/check-in" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                发起打卡
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex items-center gap-2 px-4 py-2 rounded-md ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
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
            className="mt-2 w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            项目管理系统
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, User</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
