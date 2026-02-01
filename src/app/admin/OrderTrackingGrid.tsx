"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Order = {
  id: string;
  user_id: string;
  total_amount: string;
  status: string;
  payment_id: string;
  created_at: string;
  product_id: string;
  user_name: string;
  user_email: string;
};

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

const TRACKING_STATUSES = [
  "ORDER_PLACED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_DELIVERY",
  "RETURNED",
];

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: "bg-blue-500",
  PROCESSING: "bg-yellow-500",
  PACKED: "bg-orange-500",
  SHIPPED: "bg-purple-500",
  IN_TRANSIT: "bg-indigo-500",
  OUT_FOR_DELIVERY: "bg-cyan-500",
  DELIVERED: "bg-green-500",
  FAILED_DELIVERY: "bg-red-500",
  RETURNED: "bg-gray-500",
};

export default function OrderTrackingGrid() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingTracking, setIsAddingTracking] = useState(false);
  const [newTrackingStatus, setNewTrackingStatus] = useState("ORDER_PLACED");
  const [newTrackingAddress, setNewTrackingAddress] = useState("");
  const [newTrackingNotes, setNewTrackingNotes] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!apiUrl) throw new Error("API URL not configured");

      const res = await fetch(`${apiUrl}/api/orders/`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      const ordersList = Array.isArray(data) ? data : [];
      setOrders(ordersList);

      // Fetch tracking for all orders in parallel
      const trackingPromises = ordersList.map(async (order: Order) => {
        try {
          // Use correct endpoint: /api/track/order/:orderId
          const trackRes = await fetch(`${apiUrl}/api/track/order/${order.id}`);
          if (trackRes.ok) {
            const trackData = await trackRes.json();
            return { orderId: order.id, history: trackData.tracking_history || [] };
          }
        } catch {
          // Silently fail for individual tracking fetches
        }
        return { orderId: order.id, history: [] };
      });

      const trackingResults = await Promise.all(trackingPromises);
      const trackingMap: Record<string, TrackingEntry[]> = {};
      trackingResults.forEach(({ orderId, history }) => {
        trackingMap[orderId] = history;
      });
      setTrackingData(trackingMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingForOrder = async (orderId: string) => {
    if (!apiUrl) return;
    try {
      // Use correct endpoint: /api/track/order/:orderId
      const trackRes = await fetch(`${apiUrl}/api/track/order/${orderId}`);
      if (trackRes.ok) {
        const trackData = await trackRes.json();
        setTrackingData((prev) => ({
          ...prev,
          [orderId]: trackData.tracking_history || [],
        }));
      }
    } catch (err) {
      console.error("Failed to fetch tracking:", err);
    }
  };

  const getLatestTracking = (orderId: string): TrackingEntry | null => {
    const history = trackingData[orderId];
    if (!history || history.length === 0) return null;
    return history[history.length - 1];
  };

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setAddSuccess(false);
    // Set default status to next logical status
    const latestTracking = getLatestTracking(order.id);
    const currentStatusIndex = latestTracking
      ? TRACKING_STATUSES.indexOf(latestTracking.status)
      : -1;
    const nextStatus = TRACKING_STATUSES[Math.min(currentStatusIndex + 1, TRACKING_STATUSES.length - 1)] || "ORDER_PLACED";
    setNewTrackingStatus(nextStatus);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setIsAddingTracking(false);
    setNewTrackingStatus("ORDER_PLACED");
    setNewTrackingAddress("");
    setNewTrackingNotes("");
    setAddSuccess(false);
  };

  const addTrackingUpdate = async () => {
    if (!selectedOrder || !apiUrl) return;

    setIsAddingTracking(true);
    setAddSuccess(false);

    try {
      // Use correct endpoints:
      // POST /api/track/add - for tracking without address
      // POST /api/track/add-with-address - for tracking with address
      const endpoint = newTrackingAddress
        ? `${apiUrl}/api/track/add-with-address`
        : `${apiUrl}/api/track/add`;

      const requestBody: Record<string, string | null> = {
        order_id: selectedOrder.id,
        status: newTrackingStatus,
        notes: newTrackingNotes || null,
      };

      if (newTrackingAddress) {
        requestBody.address = newTrackingAddress;
      }

      console.log("Sending tracking update:", { endpoint, body: requestBody });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add tracking (${res.status})`);
      }

      const result = await res.json();
      console.log("Tracking added successfully:", result);

      // Refresh tracking data for this order
      await fetchTrackingForOrder(selectedOrder.id);

      // Clear form and show success
      setNewTrackingAddress("");
      setNewTrackingNotes("");
      setAddSuccess(true);
      toast.success("Tracking update added successfully!");

      // Set next logical status
      const currentStatusIndex = TRACKING_STATUSES.indexOf(newTrackingStatus);
      const nextStatus = TRACKING_STATUSES[Math.min(currentStatusIndex + 1, TRACKING_STATUSES.length - 1)];
      setNewTrackingStatus(nextStatus);

    } catch (err) {
      console.error("Failed to add tracking:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add tracking update");
    } finally {
      setIsAddingTracking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIndex = (status: string) => TRACKING_STATUSES.indexOf(status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const latestTracking = getLatestTracking(order.id);
          const currentStatus = latestTracking?.status || order.status;

          return (
            <div
              key={order.id}
              onClick={() => openTrackingModal(order)}
              className="bg-white/10 backdrop-blur-sm border border-green-500/30 p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-white">
                    {order.user_name}
                  </h3>
                  <p className="text-sm text-gray-400">{order.user_email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs text-white ${
                    STATUS_COLORS[currentStatus] || "bg-gray-500"
                  }`}
                >
                  {currentStatus.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-500">Order ID:</span>{" "}
                  {order.id.slice(0, 8)}...
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Amount:</span> Rs.
                  {order.total_amount}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Date:</span>{" "}
                  {formatDate(order.created_at)}
                </p>
              </div>

              {latestTracking?.address_display && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-xs text-gray-400">Last Location:</p>
                  <p className="text-sm text-gray-300 truncate">
                    {latestTracking.address_display}
                  </p>
                </div>
              )}

              <div className="mt-3 flex gap-1">
                {TRACKING_STATUSES.slice(0, 7).map((status, idx) => (
                  <div
                    key={status}
                    className={`flex-1 h-1 rounded-full ${
                      idx <= getStatusIndex(currentStatus)
                        ? STATUS_COLORS[currentStatus]
                        : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-gray-400 py-12">No orders found</div>
      )}

      {/* Tracking Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative bg-gray-900 border border-green-500/30 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Order Tracking</h2>
                <p className="text-sm text-green-200">
                  {selectedOrder.user_name} - {selectedOrder.id.slice(0, 8)}...
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-green-200 text-2xl"
              >
                x
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Order Info */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <p className="text-white">{selectedOrder.user_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="text-white">{selectedOrder.user_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="text-white">Rs.{selectedOrder.total_amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment ID:</span>
                    <p className="text-white">{selectedOrder.payment_id}</p>
                  </div>
                </div>
              </div>

              {/* Add Tracking Form - Moved to top for better UX */}
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Add Tracking Update
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Status *
                    </label>
                    <select
                      value={newTrackingStatus}
                      onChange={(e) => setNewTrackingStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      {TRACKING_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Address (optional - will geocode to get coordinates)
                    </label>
                    <input
                      type="text"
                      value={newTrackingAddress}
                      onChange={(e) => setNewTrackingAddress(e.target.value)}
                      placeholder="e.g., Mumbai, Maharashtra"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={newTrackingNotes}
                      onChange={(e) => setNewTrackingNotes(e.target.value)}
                      placeholder="Add any notes about this status update"
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={addTrackingUpdate}
                    disabled={isAddingTracking}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isAddingTracking ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </span>
                    ) : (
                      "Add Tracking Update"
                    )}
                  </button>

                  {addSuccess && (
                    <p className="text-green-400 text-sm text-center">
                      Tracking update added successfully!
                    </p>
                  )}
                </div>
              </div>

              {/* Tracking Timeline */}
              <h3 className="text-lg font-semibold text-white mb-4">
                Tracking History
              </h3>

              <div className="space-y-4">
                {(trackingData[selectedOrder.id] || []).length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No tracking updates yet. Add the first one above!
                  </p>
                ) : (
                  [...(trackingData[selectedOrder.id] || [])].reverse().map((entry, idx, arr) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            STATUS_COLORS[entry.status] || "bg-gray-500"
                          }`}
                        />
                        {idx < arr.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-600 mt-1 min-h-[20px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <span
                            className={`px-2 py-1 rounded text-xs text-white ${
                              STATUS_COLORS[entry.status] || "bg-gray-500"
                            }`}
                          >
                            {entry.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        {entry.address_display && (
                          <p className="text-sm text-gray-300 mt-2">
                            {entry.address_display}
                          </p>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-gray-400 mt-1 italic">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
