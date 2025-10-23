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
      style={{
        textDecoration: 'none',
        color: isActive ? '#3498db' : '#666',
        fontWeight: isActive ? 'bold' : 'normal',
        padding: '10px 15px',
        borderRadius: '4px',
        backgroundColor: isActive ? '#f0f8ff' : 'transparent'
      }}
    >
      {children}
    </Link>
  );
}