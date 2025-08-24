'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  icon,
  description,
  trend,
  color = 'var(--accent-color)',
  onClick
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-2xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium opacity-80 mb-2">
            {title}
          </h3>
          <p 
            className="text-2xl font-bold mb-1" 
            style={{ color }}
          >
            {value}
          </p>
          {description && (
            <p className="text-sm opacity-60">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  trend.isPositive 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs opacity-60 mr-2">
                نسبت به ماه قبل
              </span>
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-xl"
          style={{ 
            backgroundColor: `${color}20`,
            color 
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
