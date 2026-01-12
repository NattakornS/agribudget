import React from 'react';

interface PageNavHeaderProps {
  title: string;
  description?: string;
  coverImage?: string | null;
}

const PageNavHeader: React.FC<PageNavHeaderProps> = ({ 
  title, 
  description, 
  coverImage 
}) => {
  return (
    <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
      {/* Background Image with Blur Effect */}
      {coverImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center blur-[2px]"
          style={{
            backgroundImage: `url(${coverImage})`,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600" />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-6 py-8">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-white/90 drop-shadow-md mt-2 max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageNavHeader;
