import { useState } from "react";

export default function MyClass() {
  const [classes] = useState([
    {
      id: 1,
      name: "2024级 计算机科学与技术 1班",
      students: [
        { id: 101, name: "张三", number: "2024001" },
        { id: 102, name: "李四", number: "2024002" },
        { id: 103, name: "王五", number: "2024003" },
      ]
    },
    {
      id: 2,
      name: "英语辅修班",
      students: [
        { id: 201, name: "张三", number: "2024001" },
        { id: 202, name: "赵六", number: "2024008" },
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">我的班级</h2>
      <div className="grid gap-4">
        {classes.map((cls) => (
          <details key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 group">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-lg font-medium">{cls.name}</span>
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 border-t border-gray-100 pt-2 text-sm text-gray-600">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2">学号</th>
                    <th className="py-2">姓名</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.students.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2">{student.number}</td>
                      <td className="py-2">{student.name}</td>
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
