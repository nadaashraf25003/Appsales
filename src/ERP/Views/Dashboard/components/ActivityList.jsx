// src/ERP/Views/Dashboard/Activities.jsx
const dummyActivities = [
  { 
    id: 1, 
    activity: "Order #1234 completed", 
    time: "2h ago",
    user: "John Doe",
    type: "order",
    icon: "📦"
  },
  { 
    id: 2, 
    activity: "New customer registered", 
    time: "3h ago",
    user: "Jane Smith",
    type: "customer",
    icon: "👤"
  },
  { 
    id: 3, 
    activity: "Invoice #567 sent", 
    time: "5h ago",
    user: "Alice Johnson",
    type: "invoice",
    icon: "📄"
  },
  { 
    id: 4, 
    activity: "Payment received for Order #1232", 
    time: "1d ago",
    user: "Robert Brown",
    type: "payment",
    icon: "💰"
  },
  { 
    id: 5, 
    activity: "Inventory updated for Product A", 
    time: "1d ago",
    user: "System",
    type: "inventory",
    icon: "📊"
  },
];

const Activities = () => {
  return (
    <div className="p-6 animate-slideDown">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
          Activity Log
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track all system activities and user actions
        </p>
      </div>

      {/* Activity Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="btn-primary px-4 py-2 text-sm">
          All Activities
        </button>
        <button className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
          Orders
        </button>
        <button className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
          Customers
        </button>
        <button className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
          Invoices
        </button>
        <button className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
          System
        </button>
      </div>

      {/* Activities List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">Activity</th>
                <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">User</th>
                <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">Time</th>
                <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {dummyActivities.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-gray-800 dark:text-light font-medium">{item.activity}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                    {item.user}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                      {item.time}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      item.type === 'order' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : item.type === 'customer'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : item.type === 'invoice'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing 1-5 of 42 activities
          </p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              ←
            </button>
            <button className="p-2 px-4 bg-primary text-white dark:bg-dark-primary rounded-lg">
              1
            </button>
            <button className="p-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              2
            </button>
            <button className="p-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              3
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;