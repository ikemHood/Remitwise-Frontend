import React from 'react';
import { TrendingUp, FileText, Shield, Users } from 'lucide-react';
import DarkFeatureCard from './DarkFeatureCard';

const features = [
  {
    icon: <TrendingUp size={24} />,
    title: "Goal-Based Savings",
    description: "Set education, medical, or marriage goals with visual progress tracking."
  },
  {
    icon: <FileText size={24} />,
    title: "Seamless Bill Payments",
    description: "Automated bill payments for electricity, rent, and school fees with reminders."
  },
  {
    icon: <Shield size={24} />,
    title: "Micro-Insurance",
    description: "Health and emergency coverage with auto-paid premiums from remittances."
  },
  {
    icon: <Users size={24} />,
    title: "Family Wallets",
    description: "Separate wallets with spending limits and approval workflows for security."
  }
];

const FeatureSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <DarkFeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
