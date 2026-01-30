import React from "react";

export default function Dropdown({ items, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card shadow-card dark:shadow-card-dark rounded-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700 animate-slideDown"
      onMouseLeave={onClose}
    >
      <div className="py-1">
        {items.map((item, index) => (
          <button
            key={index}
            className={`
              w-full text-left px-4 py-3 
              text-gray-800 dark:text-light
              hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors duration-200
              flex items-center space-x-3
              border-b border-gray-100 dark:border-gray-700 last:border-b-0
              ${item.variant === 'danger' ? 'hover:!bg-red-50 dark:hover:!bg-red-900/20 text-red-600 dark:text-red-400' : ''}
              ${item.variant === 'success' ? 'hover:!bg-green-50 dark:hover:!bg-green-900/20 text-brand-success' : ''}
              ${item.variant === 'warning' ? 'hover:!bg-orange-50 dark:hover:!bg-orange-900/20 text-brand-warning' : ''}
              ${item.variant === 'info' ? 'hover:!bg-cyan-50 dark:hover:!bg-cyan-900/20 text-brand-info' : ''}
            `}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
          >
            {/* Icon container with consistent sizing */}
            {item.icon && (
              <span className="flex-shrink-0 w-5 h-5">
                <item.icon />
              </span>
            )}
            
            {/* Label with optional description */}
            <div className="flex-1 min-w-0">
              <span className="block font-medium truncate">{item.label}</span>
              {item.description && (
                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {item.description}
                </span>
              )}
            </div>
            
            {/*  badge or shortcut */}
            {item.badge && (
              <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/*  divider or footer */}
      {items.some(item => item.section) && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            {items.find(item => item.section)?.section}
          </div>
        </>
      )}
    </div>
  );
}