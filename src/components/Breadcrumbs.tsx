"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 px-4 md:px-0">
      <Link 
        href="/" 
        className="flex items-center hover:text-orange-600 transition-colors duration-200"
      >
        <Home className="w-4 h-4 mr-1" />
        <span>Inicio</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href} 
              className="hover:text-orange-600 transition-colors duration-200 truncate max-w-[150px] md:max-w-none"
              title={item.label}
              onClick={() => {
                console.log('🍞 Breadcrumb - Navegando a:', item.href);
                console.log('🍞 Breadcrumb - Label:', item.label);
                
                // DEBUGGING: Log detallado del clic en breadcrumb
                console.log('🐛 DEBUG - Breadcrumb Click - URL completa:', item.href);
                console.log('🐛 DEBUG - Breadcrumb Click - Contiene Abrigos?:', item.href?.includes('Abrigos'));
                console.log('🐛 DEBUG - Breadcrumb Click - Contiene vestidos?:', item.href?.includes('vestidos'));
                console.log('🐛 DEBUG - Breadcrumb Click - URL actual antes del clic:', window.location.href);
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className="text-gray-800 font-medium truncate max-w-[150px] md:max-w-none" 
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}