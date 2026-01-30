// src/ERP/Views/Dashboard/components/StatsCard.jsx
export const StatsCard = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    primary: 'bg-purple-100 text-primary dark:bg-purple-900/30 dark:text-dark-primary',
    success: 'bg-green-100 text-success dark:bg-green-900/30 dark:text-dark-success',
    info: 'bg-cyan-100 text-info dark:bg-cyan-900/30 dark:text-dark-info',
    warning: 'bg-orange-100 text-warning dark:bg-orange-900/30 dark:text-dark-warning',
  };

  return (
    <div className="card group hover:shadow-card-hover cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-light">{value}</p>
          {trend && (
            <p className={`text-sm font-medium mt-2 ${color === 'warning' ? 'text-brand-warning' : 'text-brand-success'}`}>
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.primary}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color === 'primary' ? 'bg-primary dark:bg-dark-primary' : color === 'success' ? 'bg-success dark:bg-dark-success' : color === 'info' ? 'bg-info dark:bg-dark-info' : 'bg-warning dark:bg-dark-warning'}`}
          style={{ width: '75%' }}
        ></div>
      </div>
    </div>
  );
};