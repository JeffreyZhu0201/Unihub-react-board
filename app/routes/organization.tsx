import { useState } from "react";

export default function Organization() {
  const [organizations] = useState([
    {
      id: 1,
      name: "计算机科学协会",
      students: [
        { id: 101, name: "张三", role: "会长" },
        { id: 102, name: "李四", role: "成员" },
      ]
    },
    {
      id: 2,
      name: "志愿者服务队",
      students: [
        { id: 201, name: "王五", role: "队长" },
        { id: 202, name: "赵六", role: "成员" },
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">我的组织</h2>
      <div className="grid gap-4">
        {organizations.map((org) => (
          <details key={org.id} className="bg-white rounded-lg shadow-sm border border-gray-200 group">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-lg font-medium">{org.name}</span>
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 border-t border-gray-100 pt-2 text-sm text-gray-600">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2">姓名</th>
                    <th className="py-2">职务</th>
                  </tr>
                </thead>
                <tbody>
                  {org.students.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2">{student.name}</td>
                      <td className="py-2">{student.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
