import React from 'react';

interface DarkFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DarkFeatureCard: React.FC<DarkFeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-[#121212] p-8 rounded-2xl flex flex-col items-start gap-6 border border-white/5 hover:border-red-500/30 transition-all duration-300 group">
      <div className="w-12 h-12 bg-[#2D0A0A] rounded-xl flex items-center justify-center text-[#FF3B30] group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-white leading-tight">
          {title}
        </h3>
        <p className="text-gray-400 text-base leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default DarkFeatureCard;
