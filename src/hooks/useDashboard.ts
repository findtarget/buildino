// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';

interface DashboardData {
  units: {
    total: number;
    residential: number;
    commercial: number;
    occupied: number;
    vacant: number;
  };
  financial: {
    monthlyIncome: number;
    monthlyExpenses: number;
    balance: number;
    overduePayments: number;
    averagePayment: number;
  };
}

export function useDashboard(period: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/dashboard?period=${period}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
}
