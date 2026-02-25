'use client';

import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';

type SwaggerUIWrapperProps = {
  specUrl: string;
};

export default function SwaggerUIWrapper({ specUrl }: SwaggerUIWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-lg">Loading API Spec...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <SwaggerUI url={specUrl} />
    </div>
  );
}
