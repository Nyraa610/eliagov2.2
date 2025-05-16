
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">App Name</Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/about" className="hover:text-gray-300">About</Link>
          <Link to="/pricing" className="hover:text-gray-300">Pricing</Link>
          <Link to="/contact" className="hover:text-gray-300">Contact</Link>
          <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/account" className="hover:text-gray-300">Account</Link>
          <Link to="/documents/personal" className="hover:text-gray-300">Documents</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
