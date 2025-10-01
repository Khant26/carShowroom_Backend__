import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  PhotoIcon, 
  BuildingStorefrontIcon, 
  TruckIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Banners', href: '/banners', icon: PhotoIcon },
    { name: 'Brands', href: '/brands', icon: BuildingStorefrontIcon },
    { name: 'Cars', href: '/cars', icon: TruckIcon },
    { name: 'Rentals', href: '/rentals', icon: ClipboardDocumentListIcon },
  ];

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Car Showroom Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <item.icon 
                className={`
                  mr-3 h-5 w-5 transition-colors
                  ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                `} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;