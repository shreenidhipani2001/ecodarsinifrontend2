'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Package, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

type TrackingEntry = {
  id: string;
  order_id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address_display: string | null;
  address_city: string | null;
  address_state: string | null;
  created_at: string;
  notes: string | null;
};

// Response from /api/track/my/:userId - flat tracking entries
type TrackingResponse = {
  id: string;
  order_id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address_display: string | null;
  address_city: string | null;
  address_state: string | null;
  created_at: string;
  notes: string | null;
  total_amount: string;
  user_id: string;
  user_name: string;
};

type OrderWithTracking = {
  order_id: string;
  total_amount: string;
  order_status: string;
  order_created_at: string;
  tracking_history: TrackingEntry[];
};

const TRACKING_STATUSES = [
  'ORDER_PLACED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED_DELIVERY',
  'RETURNED',
];

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: 'bg-blue-500',
  PROCESSING: 'bg-yellow-500',
  PACKED: 'bg-orange-500',
  SHIPPED: 'bg-purple-500',
  IN_TRANSIT: 'bg-indigo-500',
  OUT_FOR_DELIVERY: 'bg-cyan-500',
  DELIVERED: 'bg-green-500',
  FAILED_DELIVERY: 'bg-red-500',
  RETURNED: 'bg-gray-500',
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  ORDER_PLACED: 'text-blue-600',
  PROCESSING: 'text-yellow-600',
  PACKED: 'text-orange-600',
  SHIPPED: 'text-purple-600',
  IN_TRANSIT: 'text-indigo-600',
  OUT_FOR_DELIVERY: 'text-cyan-600',
  DELIVERED: 'text-green-600',
  FAILED_DELIVERY: 'text-red-600',
  RETURNED: 'text-gray-600',
};

export default function TrackOrderModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [orders, setOrders] = useState<OrderWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
const user = useAuthStore((state) => state.user);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchMyOrders = async () => {
      console.log('Fetching orders for userId:', userId);
      if (!userId || !apiUrl) return;

      try {
        setLoading(true);
        // Use correct endpoint: /api/track/my/:userId
        console.log(`${apiUrl}/api/track/my/${userId}`);
        const res = await fetch(`${apiUrl}/api/track/my/${userId}`);

        if (!res.ok) throw new Error('Failed to fetch orders');

        const data: TrackingResponse[] = await res.json();
        console.log('Fetched tracking data:', data);

        // Group tracking entries by order_id
        const ordersMap = new Map<string, OrderWithTracking>();

        for (const entry of data) {
          if (!ordersMap.has(entry.order_id)) {
            ordersMap.set(entry.order_id, {
              order_id: entry.order_id,
              total_amount: entry.total_amount,
              order_status: entry.status,
              order_created_at: entry.created_at,
              tracking_history: [],
            });
          }

          const order = ordersMap.get(entry.order_id)!;
          order.tracking_history.push({
            id: entry.id,
            order_id: entry.order_id,
            status: entry.status,
            latitude: entry.latitude,
            longitude: entry.longitude,
            address_display: entry.address_display,
            address_city: entry.address_city,
            address_state: entry.address_state,
            created_at: entry.created_at,
            notes: entry.notes,
          });
        }

        // Sort tracking history by created_at for each order
        const ordersArray = Array.from(ordersMap.values()).map(order => ({
          ...order,
          tracking_history: order.tracking_history.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ),
        }));

        setOrders(ordersArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [userId, apiUrl]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIndex = (status: string) => TRACKING_STATUSES.indexOf(status);

  const getLatestStatus = (order: OrderWithTracking): string => {
    if (order.tracking_history && order.tracking_history.length > 0) {
      return order.tracking_history[order.tracking_history.length - 1].status;
    }
    return order.order_status;
  };

  const getLatestLocation = (order: OrderWithTracking): string | null => {
    if (order.tracking_history && order.tracking_history.length > 0) {
      const latest = order.tracking_history[order.tracking_history.length - 1];
      return latest.address_display || null;
    }
    return null;
  };

  return (
    <BaseModal title="Track My Orders" onClose={onClose}>
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Package size={48} className="mb-4 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStatus = getLatestStatus(order);
              const isExpanded = expandedOrders.has(order.order_id);
              const latestLocation = getLatestLocation(order);

              return (
                <div
                  key={order.order_id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    onClick={() => toggleExpand(order.order_id)}
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package size={18} className="text-gray-600" />
                          <span className="font-medium text-gray-800">
                            Order #{order.order_id.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Rs.{order.total_amount} | {formatDate(order.order_created_at)}
                        </div>
                        {latestLocation && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            <span className="truncate max-w-[250px]">{latestLocation}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs text-white ${
                            STATUS_COLORS[currentStatus] || 'bg-gray-500'
                          }`}
                        >
                          {currentStatus.replace(/_/g, ' ')}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 flex gap-1">
                      {TRACKING_STATUSES.slice(0, 7).map((status, idx) => (
                        <div
                          key={status}
                          className={`flex-1 h-1.5 rounded-full ${
                            idx <= getStatusIndex(currentStatus)
                              ? STATUS_COLORS[currentStatus]
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Expanded Timeline */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-4">Tracking Timeline</h4>

                      {(!order.tracking_history || order.tracking_history.length === 0) ? (
                        <p className="text-gray-400 text-center py-4">
                          No tracking updates yet
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {order.tracking_history.map((entry, idx) => (
                            <div key={entry.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    STATUS_COLORS[entry.status]
                                  }`}
                                />
                                {idx < order.tracking_history.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex justify-between items-start">
                                  <span
                                    className={`font-medium ${
                                      STATUS_TEXT_COLORS[entry.status] || 'text-gray-600'
                                    }`}
                                  >
                                    {entry.status.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(entry.created_at)}
                                  </span>
                                </div>
                                {entry.address_display && (
                                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                    <MapPin size={12} />
                                    {entry.address_display}
                                  </p>
                                )}
                                {entry.notes && (
                                  <p className="text-sm text-gray-500 mt-1 italic">
                                    {entry.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
