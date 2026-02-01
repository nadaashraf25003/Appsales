import React, { useState, useMemo, useEffect } from "react";
import useItem from "@/Hooks/useItem";
import useSales from "@/Hooks/useSales";
import Loader from "@/Components/Global/Loader";

const POSMain = () => {
  // Tenant ID state
  const [tenantInput, setTenantInput] = useState("");
  const [tenantId, setTenantId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { getItemsQuery, updateItemMutation } = useItem();
  const { createOrderMutation } = useSales();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // console.log("Current User:", user.id);

  // Fetch products based on tenantId
  const { data: products, isLoading } = getItemsQuery(tenantId || 0);
  console.log("Products:", products);

  // Cart state
  const [cart, setCart] = useState([]);

  const [orderDetails, setOrderDetails] = useState({
    branchId: 0,
    shiftId: 0,
    customerId: 0,
    orderType: "DineIn",
    status: "Pending",
    discountAmount: 0,
    paidAmount: 0,
    notes: "",
  });

  // Auto-extract categories from products
  const categories = useMemo(() => {
    if (!products) return ["All"];
    const cats = [
      "All",
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    return cats;
  }, [products]);

  // Add to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          sellingPrice: product.sellingPrice || product.costPerUnit || 0,
        },
      ];
    });
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, currentQuantity: p.currentQuantity - 1 }
          : p,
      ),
    );

    // Reduce currentQuantity by 1
    // updateItemMutation.mutate({
    //   id: product.id,
    //   data: {
    //     name: product.name,
    //     sellingPrice: product.sellingPrice || product.costPerUnit || 0,
    //     currentStock: (product.currentQuantity || 0) - 1,
    //     minStockLevel: product.minQuantity || 5,
    //     isActive: product.isActive !== false,
    //   },
    // });
    // Open cart on mobile when adding item
    if (window.innerWidth < 768) {
      setIsCartOpen(true);
    }
  };

  // Update quantity
  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;

          const maxStock = item.currentQuantity ?? Infinity;
          const newQty = item.quantity + delta;

          if (newQty <= 0) return null;
          if (newQty > maxStock) return item;

          return { ...item, quantity: newQty };
        })
        .filter(Boolean),
    );
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    if (
      cart.length > 0 &&
      window.confirm("Are you sure you want to clear the cart?")
    ) {
      setCart([]);
    }
  };

  // Handle payment
  const confirmCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const payload = {
      tenantId: user.tenantId,
      branchId: user.branchId,
      shiftId: orderDetails.shiftId,
      customerId: orderDetails.customerId,
      orderType: orderDetails.orderType,
      status: orderDetails.status,

      subtotal: totals.subtotal,
      taxAmount: totals.vat,
      discountAmount: orderDetails.discountAmount,
      totalAmount: totals.total - orderDetails.discountAmount,
      paidAmount: orderDetails.paidAmount,

      notes: orderDetails.notes,
      createdByUserId: user.id,

      items: cart.map((item) => {
        const unitPrice = item.sellingPrice || item.costPerUnit || 0;

        return {
          itemId: item.id,
          itemVariantId: 0, // or real variant id later
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          notes: "",
        };
      }),
    };

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        alert("Order Created Successfully ✅");
        setCart([]);
        setIsCheckoutOpen(false);
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to create order ❌");
      },
    });
  };

  const handleOrderChange = (key, value) => {
    setOrderDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!localProducts) return [];
    return localProducts.filter((p) => {
      const matchesSearch = p.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.isActive !== false;
    });
  }, [localProducts, search, selectedCategory]);

  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);
  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) =>
        sum + (item.sellingPrice || item.costPerUnit || 0) * item.quantity,
      0,
    );
    const vat = subtotal * 0.14;
    const total = subtotal + vat;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, vat, total, itemCount };
  }, [cart]);

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Load tenant if localStorage has one
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.tenantId) {
      setTenantInput(user.tenantId.toString());
      setTenantId(user.tenantId);
    }
  }, []);

  // Handle tenant load
  const handleLoadTenant = () => {
    const newTenantId = parseInt(tenantInput);
    if (newTenantId > 0) {
      setTenantId(newTenantId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLoadTenant();
    }
  };

  // Get stock status
  const getStockStatus = (quantity, minQuantity = 5) => {
    if (quantity === 0)
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100" };
    if (quantity <= minQuantity)
      return { text: "Low Stock", color: "text-amber-600", bg: "bg-amber-100" };
    return { text: "In Stock", color: "text-green-600", bg: "bg-green-100" };
  };

  // Cart badge for mobile
  const CartBadge = () => (
    <button
      onClick={() => setIsCartOpen(!isCartOpen)}
      className="md:hidden fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full p-4 shadow-xl flex items-center justify-center"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {totals.itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totals.itemCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-dark-bg flex flex-col md:flex-row">
      {/* Main Content - Products Grid */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 md:p-6">
        {/* Tenant ID Input */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <input
                type="number"
                placeholder="Enter Tenant ID..."
                value={tenantInput}
                onChange={(e) => setTenantInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input text-sm md:text-base flex-1"
              />
              <button
                onClick={handleLoadTenant}
                className="btn-secondary px-4 py-2 text-sm whitespace-nowrap"
              >
                Load Products
              </button>
            </div>

            {/* Cart Toggle for Desktop */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="hidden md:flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Cart</span>
              {totals.itemCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {totals.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        {tenantId && (
          <div className="card mb-4">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input text-sm md:text-base pl-10"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {tenantId && (
          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader />
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Loading Products...
                </p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.currentQuantity || 0,
                    product.minQuantity || 5,
                  );
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="card p-3 text-left hover:shadow-lg transition-shadow active:scale-[0.98]"
                      disabled={(product.currentQuantity || 0) === 0}
                      //  disabled={product.quantity >= product.currentQuantity}
                    >
                      {/* Product Image/Icon */}
                      <div className="aspect-square mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center relative">
                        <div className="text-2xl font-bold text-primary dark:text-dark-primary">
                          {product.name?.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Stock Badge */}
                        <span
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
                        >
                          {product.currentQuantity || 0}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm md:text-base text-dark dark:text-light truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary dark:text-dark-primary">
                            {formatCurrency(
                              product.sellingPrice || product.costPerUnit || 0,
                            )}
                          </span>
                          {product.category && (
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {stockStatus.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium">No products available</p>
                <p className="text-sm">Try a different search or category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 right-0 w-full md:w-96 
        transform transition-transform duration-300 ease-in-out z-40
        ${isCartOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
      `}
      >
        <div className="h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-200 dark:border-gray-700 shadow-xl">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark dark:text-light flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Shopping Cart
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {cart.length} items
                </span>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="text-secondary dark:text-dark-secondary hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="card p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-dark dark:text-light">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(
                            item.sellingPrice || item.costPerUnit || 0,
                          )}{" "}
                          each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary dark:text-dark-primary">
                          {formatCurrency(
                            (item.sellingPrice || item.costPerUnit || 0) *
                              item.quantity,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="text-lg">-</span>
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.currentQuantity}
                          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-secondary dark:text-dark-secondary hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Add products from the catalog</p>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  VAT (14%)
                </span>
                <span className="font-medium">
                  {formatCurrency(totals.vat)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-dark dark:text-light">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-primary dark:text-dark-primary">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className="btn-primary w-full py-3 text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrderMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  PROCESSING...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  CHECKOUT NOW
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cart Toggle Button */}
      <CartBadge />

      {/* Overlay for mobile */}
      {isCartOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 mt-16">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-4xl shadow-2xl">
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">
                      Complete Checkout
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Review and confirm order details
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Two-column layout for better organization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Order Information */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Order Details Card */}
                    <div className="card p-5">
                      <h3 className="text-lg font-semibold text-dark dark:text-light mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Order Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Shift ID */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shift ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            className="input w-full"
                            placeholder="Enter Shift ID"
                            value={orderDetails.shiftId}
                            onChange={(e) =>
                              handleOrderChange("shiftId", +e.target.value)
                            }
                            min="0"
                            required
                          />
                        </div>

                        {/* Customer ID */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Customer ID
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="input w-full"
                              placeholder="0 = Walk-in Customer"
                              value={orderDetails.customerId}
                              onChange={(e) =>
                                handleOrderChange("customerId", +e.target.value)
                              }
                              min="0"
                            />
                            {orderDetails.customerId === 0 && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                Walk-in
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Order Type
                          </label>
                          <div className="flex gap-2">
                            {["DineIn", "TakeAway", "Delivery"].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  handleOrderChange("orderType", type)
                                }
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                  orderDetails.orderType === type
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                              >
                                {type.replace(/([A-Z])/g, " $1").trim()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                          </label>
                          <select
                            className="input w-full"
                            value={orderDetails.status}
                            onChange={(e) =>
                              handleOrderChange("status", e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details Card */}
                    <div className="card p-5">
                      <h3 className="text-lg font-semibold text-dark dark:text-light mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Payment Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Discount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount (EGP)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="input w-full"
                              placeholder="0.00"
                              value={orderDetails.discountAmount}
                              onChange={(e) =>
                                handleOrderChange(
                                  "discountAmount",
                                  +e.target.value,
                                )
                              }
                              min="0"
                              step="0.01"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              EGP
                            </span>
                          </div>
                        </div>

                        {/* Paid Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Paid Amount (EGP)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="input w-full"
                              placeholder="0.00"
                              value={orderDetails.paidAmount}
                              onChange={(e) =>
                                handleOrderChange("paidAmount", +e.target.value)
                              }
                              min="0"
                              step="0.01"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              EGP
                            </span>
                          </div>
                          {orderDetails.paidAmount > 0 &&
                            orderDetails.paidAmount <
                              totals.total - orderDetails.discountAmount && (
                              <p className="text-red-500 text-xs mt-1">
                                Paid amount is less than total
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Order Notes
                        </label>
                        <textarea
                          className="input w-full min-h-[80px]"
                          placeholder="Add special instructions or notes..."
                          value={orderDetails.notes}
                          onChange={(e) =>
                            handleOrderChange("notes", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Order Summary */}
                  <div className="space-y-6">
                    {/* Order Items Summary */}
                    <div className="card p-5">
                      <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                        Order Items
                      </h3>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-dark dark:text-light text-sm truncate">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.quantity} ×{" "}
                                {formatCurrency(
                                  item.sellingPrice || item.costPerUnit || 0,
                                )}
                              </div>
                            </div>
                            <div className="font-bold text-sm">
                              {formatCurrency(
                                (item.sellingPrice || item.costPerUnit || 0) *
                                  item.quantity,
                              )}
                            </div>
                          </div>
                        ))}
                        {cart.length > 5 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            + {cart.length - 5} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="card p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
                        Payment Summary
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal
                          </span>
                          <span>{formatCurrency(totals.subtotal)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            VAT (14%)
                          </span>
                          <span>{formatCurrency(totals.vat)}</span>
                        </div>

                        {orderDetails.discountAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Discount
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              -{formatCurrency(orderDetails.discountAmount)}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-dark dark:text-light">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-primary dark:text-dark-primary">
                              {formatCurrency(
                                totals.total - orderDetails.discountAmount,
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Change Due */}
                        {orderDetails.paidAmount > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Paid Amount
                              </span>
                              <span className="font-medium">
                                {formatCurrency(orderDetails.paidAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Change Due
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  orderDetails.paidAmount >=
                                  totals.total - orderDetails.discountAmount
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {formatCurrency(
                                  orderDetails.paidAmount -
                                    (totals.total -
                                      orderDetails.discountAmount),
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Payment Buttons */}
                      <div className="mt-6 grid grid-cols-3 gap-2">
                        {[100, 200, 500].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() =>
                              handleOrderChange("paidAmount", amount)
                            }
                            className="py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            {amount} EGP
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                    <button
                      className="btn-secondary py-3 px-8 text-base font-medium w-full sm:w-auto"
                      onClick={() => setIsCheckoutOpen(false)}
                      disabled={createOrderMutation.isPending}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={confirmCheckout}
                      className="btn-primary py-3 px-8 text-base font-medium w-full sm:w-auto flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        createOrderMutation.isPending || !orderDetails.shiftId
                      }
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7M5 13l4 4L19 7"
                            />
                          </svg>
                          Confirm & Create Order
                          <span className="text-sm font-normal opacity-90">
                            (
                            {formatCurrency(
                              totals.total - orderDetails.discountAmount,
                            )}
                            )
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Validation Message */}
                  {!orderDetails.shiftId && (
                    <p className="text-red-500 text-sm text-center mt-3">
                      Please enter Shift ID to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSMain;
