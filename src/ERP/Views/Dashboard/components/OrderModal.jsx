import { useState, useEffect } from "react";

const UpdateOrderModal = ({ order, onClose, onSubmit, customers }) => {
  const [formData, setFormData] = useState({
    tenantId: 1,
    branchId: 1,
    customerId: "",
    items: [{ productId: "", quantity: 1 }],
    status: "Pending",
  });

  // Initialize form with existing order data
  useEffect(() => {
    if (order) {
      setFormData({
        tenantId: order.tenantId,
        branchId: order.branchId,
        customerId: order.customerId,
        items: order.items?.map(i => ({ ...i })) || [{ productId: "", quantity: 1 }],
        status: order.status || "Pending",
      });
    }
  }, [order]);

  // Handle changes in items
  const handleItemChange = (index, key, value) => {
    const newItems = [...formData.items];
    newItems[index][key] = value;
    setFormData({ ...formData, items: newItems });
  };

  // Add new item row
  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { productId: "", quantity: 1 }] });
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length === 1) return; // prevent removing all
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  // Submit updated order
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // parent handles API update
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Update Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Customer Selection */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Customer</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: Number(e.target.value) })}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Items</label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Product ID"
                  value={item.productId}
                  onChange={(e) => handleItemChange(idx, "productId", Number(e.target.value))}
                  className="flex-1 border px-2 py-1 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                  className="w-20 border px-2 py-1 rounded"
                  min={1}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="px-2 bg-red-500 text-white rounded"
                  disabled={formData.items.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-sm text-blue-500">
              + Add Item
            </button>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-500 text-white"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateOrderModal;
