import React from 'react';
// Imported so the build hashes the file and the server can cache it for a year.
import logoImage from '../assets/logo.webp';

export default function Logo({ className = "", light = false }: { className?: string, light?: boolean }) {
  const image = (
    <img
      src={logoImage}
      alt="Matrix Solutions Company Limited — Information Technology Solutions Integrator"
      width={300}
      height={119}
      className="h-14 w-auto"
    />
  );

  // On dark backgrounds the navy wordmark is illegible, so seat the logo on a white card.
  if (light) {
    return (
      <div className={`inline-block bg-white rounded-xl px-4 py-2 ${className}`}>
        {image}
      </div>
    );
  }

  return <div className={className}>{image}</div>;
}
