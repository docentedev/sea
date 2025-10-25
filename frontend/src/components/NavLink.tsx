import { Link, useLocation } from 'wouter';
import type { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link
      href={href}
      className={`no-underline px-4 py-2.5 rounded text-sm font-medium transition-colors ${
        isActive 
          ? 'text-blue-400 bg-blue-900/20' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}