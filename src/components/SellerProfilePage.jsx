import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CubeIcon,
  ChevronDownIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const SellerProfilePage = ({ sellerData, factoryData, initialProducts, onLogout, apiBaseUrl }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Factory editing state
  const [editingFactory, setEditingFactory] = useState(false);
  const [tempFactoryData, setTempFactoryData] = useState({ ...factoryData });

  // Product form state
  const [newProduct, setNewProduct] = useState({
    productName: '',
    price: '',
    description: '',
    stockQuantity: '',
    unit: 'kg',
    productImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Available units
  const units = [
    { value: 'kg', label: 'Kilogram (kg)', category: 'Weight' },
    { value: 'g', label: 'Gram (g)', category: 'Weight' },
    { value: 'lb', label: 'Pound (lb)', category: 'Weight' },
    { value: 'oz', label: 'Ounce (oz)', category: 'Weight' },
    { value: 'l', label: 'Liter (l)', category: 'Volume' },
    { value: 'ml', label: 'Milliliter (ml)', category: 'Volume' },
    { value: 'gal', label: 'Gallon (gal)', category: 'Volume' },
    { value: 'pcs', label: 'Pieces (pcs)', category: 'Count' },
    { value: 'box', label: 'Box', category: 'Count' },
    { value: 'pack', label: 'Pack', category: 'Count' }
  ];

  // Load products from backend on component mount
  useEffect(() => {
    if (sellerData?.id) {
      loadProducts();
    }
  }, [sellerData]);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiBaseUrl}/products/seller/${sellerData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.productName || !newProduct.price || !newProduct.description || !newProduct.stockQuantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      // Append product data
      formData.append('productName', newProduct.productName);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('stockQuantity', newProduct.stockQuantity);
      formData.append('unit', newProduct.unit);
      formData.append('sellerId', sellerData.id);
      formData.append('factoryId', factoryData.id);
      
      if (newProduct.productImage) {
        formData.append('productImage', newProduct.productImage);
      }

      const response = await fetch(`${apiBaseUrl}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(prev => [...prev, data.product]);
        resetProductForm();
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      formData.append('productName', newProduct.productName);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('stockQuantity', newProduct.stockQuantity);
      formData.append('unit', newProduct.unit);
      
      if (newProduct.productImage && typeof newProduct.productImage === 'object') {
        formData.append('productImage', newProduct.productImage);
      }

      const response = await fetch(`${apiBaseUrl}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? data.product : p
        ));
        resetProductForm();
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      productName: product.productName,
      price: product.price.toString(),
      description: product.description,
      stockQuantity: product.stockQuantity.toString(),
      unit: product.unit,
      productImage: product.productImage
    });
    setImagePreview(product.imageUrl);
    setShowAddProduct(true);
  };

  const resetProductForm = () => {
    setNewProduct({
      productName: '',
      price: '',
      description: '',
      stockQuantity: '',
      unit: 'kg',
      productImage: null
    });
    setImagePreview(null);
    setShowAddProduct(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleUpdateFactory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiBaseUrl}/factory/${factoryData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tempFactoryData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update factory data in parent component would require callback
        setEditingFactory(false);
      } else {
        setError(data.message || 'Failed to update factory details');
      }
    } catch (error) {
      console.error('Error updating factory:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setNewProduct(prev => ({ ...prev, productImage: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewProduct(prev => ({ ...prev, productImage: null }));
    setImagePreview(null);
    const fileInput = document.getElementById('productImage');
    if (fileInput) fileInput.value = '';
  };

  const getTotalProducts = () => products.length;
  const getTotalValue = () => products.reduce((total, product) => total + (product.price * product.stockQuantity), 0);

  const getFactoryTypeDisplay = (type) => {
    const types = {
      factory: 'Factory',
      shop: 'Shop',
      warehouse: 'Warehouse'
    };
    return types[type] || type;
  };

  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.category]) {
      acc[unit.category] = [];
    }
    acc[unit.category].push(unit);
    return acc;
  }, {});

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{sellerData?.name || 'Seller Dashboard'}</h1>
                <p className="text-blue-100">Seller Dashboard</p>
              </div>
              
              {/* Right side with stats and user menu */}
              <div className="flex items-center space-x-6">
                <div className="text-right text-white">
                  <p className="text-sm opacity-90">Total Products</p>
                  <p className="text-2xl font-bold">{getTotalProducts()}</p>
                </div>
                
                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2 backdrop-blur-sm border border-white/20"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="hidden sm:block">{sellerData?.name?.split(' ')[0] || 'User'}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{sellerData?.name}</p>
                        <p className="text-gray-500">{sellerData?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: 'Overview', icon: UserIcon },
                { id: 'products', name: 'Products', icon: ShoppingBagIcon },
                { id: 'factory', name: 'Factory Details', icon: BuildingOfficeIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Quick Stats */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{getTotalProducts()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
                      <p className="text-2xl font-bold text-gray-900">${getTotalValue().toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Business Type</p>
                      <p className="text-2xl font-bold text-gray-900">{getFactoryTypeDisplay(factoryData?.factoryType)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <CubeIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Stock Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.reduce((total, product) => total + product.stockQuantity, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => {
                      setTempFactoryData({ ...factoryData });
                      setEditingFactory(true);
                      setActiveTab('factory');
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span>Edit Factory Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-6">Get started by adding your first product</p>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition duration-200">
                        {/* Product Image */}
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <PhotoIcon className="w-12 h-12 text-gray-400" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
                          <p className="text-2xl font-bold text-green-600">${product.price}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                          <p className="text-sm font-medium text-gray-700">
                            Stock: {product.stockQuantity} {product.unit}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg transition duration-200 flex items-center justify-center space-x-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-lg transition duration-200 flex items-center justify-center space-x-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Factory Details Tab */}
          {activeTab === 'factory' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Factory Information</h2>
                {!editingFactory && (
                  <button
                    onClick={() => {
                      setTempFactoryData({ ...factoryData });
                      setEditingFactory(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>
              
              {editingFactory ? (
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        Factory Name
                      </label>
                      <input
                        type="text"
                        value={tempFactoryData.name || ''}
                        onChange={(e) => setTempFactoryData({...tempFactoryData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                        Business Type
                      </label>
                      <select
                        value={tempFactoryData.factoryType || ''}
                        onChange={(e) => setTempFactoryData({...tempFactoryData, factoryType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select business type</option>
                        <option value="factory">Factory</option>
                        <option value="shop">Shop</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <PhoneIcon className="w-4 h-4 inline mr-2" />
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={tempFactoryData.contactNumber || ''}
                        onChange={(e) => setTempFactoryData({...tempFactoryData, contactNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPinIcon className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={tempFactoryData.address || ''}
                        onChange={(e) => setTempFactoryData({...tempFactoryData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFactory(false);
                        setTempFactoryData({ ...factoryData });
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateFactory}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      Factory Name
                    </label>
                    <p className="text-lg text-gray-900">{factoryData?.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                      Business Type
                    </label>
                    <p className="text-lg text-gray-900">{getFactoryTypeDisplay(factoryData?.factoryType)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <PhoneIcon className="w-4 h-4 inline mr-2" />
                      Contact Number
                    </label>
                    <p className="text-lg text-gray-900">{factoryData?.contactNumber}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="w-4 h-4 inline mr-2" />
                      Address
                    </label>
                    <p className="text-lg text-gray-900">{factoryData?.address}</p>
                    {factoryData?.coordinates && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 Coordinates: {factoryData.coordinates.latitude?.toFixed(6)}, {factoryData.coordinates.longitude?.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={resetProductForm}
                  className="p-1 hover:bg-gray-100 rounded-full transition duration-200"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Product Image Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <PhotoIcon className="w-4 h-4 inline mr-2" />
                  Product Image <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                
                <div className="space-y-4">
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition duration-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No image selected</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="productImage"
                      className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                    >
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                      <input
                        type="file"
                        id="productImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ShoppingBagIcon className="w-4 h-4 inline mr-2" />
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter product name"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                  Description
                </label>
                <textarea
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Enter product description..."
                />
              </div>

              {/* Stock Quantity with Unit Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CubeIcon className="w-4 h-4 inline mr-2" />
                  Stock Quantity
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter quantity"
                  />
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUnitPopup(true)}
                      className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 flex items-center space-x-2 min-w-[100px]"
                    >
                      <span className="text-sm font-medium">
                        {units.find(u => u.value === newProduct.unit)?.label.split('(')[1]?.replace(')', '') || newProduct.unit}
                      </span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={resetProductForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Selection Popup */}
      {showUnitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Unit</h3>
              <button
                onClick={() => setShowUnitPopup(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition duration-200"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {Object.entries(groupedUnits).map(([category, categoryUnits]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {categoryUnits.map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() => {
                          setNewProduct(prev => ({ ...prev, unit: unit.value }));
                          setShowUnitPopup(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center justify-between hover:bg-purple-50 ${
                          newProduct.unit === unit.value
                            ? 'bg-purple-100 border border-purple-200 text-purple-800'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{unit.label}</span>
                        {newProduct.unit === unit.value && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowUnitPopup(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfilePage;
