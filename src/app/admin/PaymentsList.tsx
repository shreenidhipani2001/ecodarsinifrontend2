'use client';

import { useEffect, useState, useCallback } from 'react';
import { CreditCard, User as UserIcon, Calendar, IndianRupee, Hash, CheckCircle, XCircle, Clock } from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
};

type Payment = {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: string;
  status: string;
  created_at: string;
  user_id: string;
  total_amount: string;
  payment_id: string;
  product_id: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchPaymentsData = async (): Promise<Payment[]> => {
  if (!API_URL) throw new Error('API URL not configured');

  const res = await fetch(`${API_URL}/api/payments/`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : data?.payments || data?.data || [];
};

const fetchUsersData = async (): Promise<UserType[]> => {
  if (!API_URL) throw new Error('API URL not configured');

  const res = await fetch(`${API_URL}/api/users/`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  console.log('Fetched users data:', data);
  return Array.isArray(data) ? data : data?.users || data?.data || [];
};

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsData, usersData] = await Promise.all([
        fetchPaymentsData(),
        fetchUsersData(),
      ]);
      setPayments(paymentsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getUserName = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user?.name || `${userId.slice(0, 8)}...`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle size={18} className="text-green-400" />;
      case 'FAILED':
        return <XCircle size={18} className="text-red-400" />;
      default:
        return <Clock size={18} className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'bg-green-900/50 text-green-400 border-green-700';
      case 'FAILED':
        return 'bg-red-900/50 text-red-400 border-red-700';
      default:
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4 mx-auto" />
          <p className="text-green-400 text-lg">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-red-400">
        <div className="text-center">
          <p className="text-xl mb-2">Failed to load payments</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <CreditCard size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-xl text-gray-400">No payments yet</p>
          <p className="text-sm text-gray-600 mt-2">Payments will appear here once customers make transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-green-900/30 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20"
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(payment.status)}`}>
                {getStatusIcon(payment.status)}
                <span className="text-sm font-medium">{payment.status}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                <IndianRupee size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 my-4" />

            {/* Payment ID */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                <Hash size={14} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Payment ID</p>
                <p className="text-sm text-gray-300 truncate" title={payment.razorpay_payment_id}>
                  {payment.razorpay_payment_id || 'N/A'}
                </p>
              </div>
            </div>

            {/* Order ID */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                <CreditCard size={14} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="text-sm text-gray-300 truncate" title={payment.razorpay_order_id}>
                  {payment.razorpay_order_id || 'N/A'}
                </p>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-900/50 flex items-center justify-center">
                <UserIcon size={14} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">User</p>
                <p className="text-sm text-gray-300 truncate" title={payment.user_id}>
                  {getUserName(payment.user_id)}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={14} />
              <span className="text-xs">{formatDate(payment.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="sticky bottom-0 mt-6 p-4 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-green-900/30">
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Total Payments: <span className="text-green-400 font-semibold">{payments.length}</span>
          </p>
          <p className="text-gray-400">
            Total Amount:{' '}
            <span className="text-green-400 font-semibold">
              ₹{payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString('en-IN')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
