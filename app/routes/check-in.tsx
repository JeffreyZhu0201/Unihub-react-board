export default function CheckIn() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">发起打卡</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">打卡主题</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="例如：早操打卡"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
            <input 
              type="datetime-local" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">说明</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-32"
              placeholder="请输入打卡要求..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">位置要求（可选）</label>
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="location" className="rounded text-indigo-600 focus:ring-indigo-500"/>
                <label htmlFor="location" className="text-gray-600 text-sm">需要获取地理位置</label>
             </div>
          </div>
          <div className="pt-4">
            <button 
              type="button" 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              发布打卡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
