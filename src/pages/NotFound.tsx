import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFound() {
  // Unknown addresses are served the same app shell, so tell search engines not to index them.
  usePageMeta({
    path: '/404',
    title: 'Page not found | Matrix Solutions',
    description: 'The page you are looking for does not exist or has moved.',
    noindex: true,
  });

  return (
    <div className="section-padding bg-white">
      <div className="container-custom text-center space-y-8 py-20">
        <div className="text-8xl font-black text-matrix-blue-primary/20">404</div>
        <h1 className="text-4xl font-extrabold text-matrix-navy">Page not found</h1>
        <p className="text-matrix-slate text-lg font-medium max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
