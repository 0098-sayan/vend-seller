import React, { useState } from 'react';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CubeIcon,
  ChevronDownIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ProductDetailsPage = ({ onComplete, onSkip, sellerData, factoryData }) => {
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    description: '',
    stockQuantity: '',
    unit: 'kg',
    productImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUnitSelect = (unit) => {
    setFormData(prev => ({
      ...prev,
      unit: unit
    }));
    setShowUnitPopup(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        productImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      productImage: null
    }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('productImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.stockQuantity.trim()) {
      newErrors.stockQuantity = 'Stock quantity is required';
    } else if (isNaN(formData.stockQuantity) || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Please enter a valid quantity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Product Data:', formData);
      
      // Prepare complete product data
      const completeProductData = {
        ...formData,
        id: Date.now(), // Generate unique ID
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        sellerInfo: sellerData,
        factoryInfo: factoryData,
        createdAt: new Date().toISOString()
      };
      
      // Call onComplete to move to next step
      if (onComplete) {
        onComplete(completeProductData);
      } else {
        alert('Product details saved successfully!');
      }
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // Group units by category for better UX
  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.category]) {
      acc[unit.category] = [];
    }
    acc[unit.category].push(unit);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Your First Product</h1>
          <p className="text-gray-600 mb-4">Tell us about what you sell</p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-green-600 font-medium ml-1">Login</span>
            </div>
            <div className="w-8 h-0.5 bg-green-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-green-600 font-medium ml-1">Factory</span>
            </div>
            <div className="w-8 h-0.5 bg-green-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span className="text-xs text-purple-600 font-medium ml-1">Products</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">4</span>
              </div>
              <span className="text-xs text-gray-500 ml-1">Profile</span>
            </div>
          </div>

          {/* Context Information */}
          {sellerData?.name && factoryData?.name && (
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-purple-800">
                <span className="font-semibold">{sellerData.name}</span>, add your first product for{' '}
                <span className="font-semibold">{factoryData.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            
            {/* Product Image Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PhotoIcon className="w-4 h-4 inline mr-2" />
                Product Image <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              
              <div className="space-y-4">
                {/* Image Preview or No Image Placeholder */}
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Remove Image Button */}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition duration-200"
                        title="Remove image"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No image selected</p>
                      <p className="text-gray-400 text-xs mt-1">Upload an image to preview</p>
                    </div>
                  )}
                </div>

                {/* File Input */}
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="productImage"
                    className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2"
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      id="productImage"
                      name="productImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Guidelines */}
                <div className="text-xs text-gray-500 text-center">
                  <p>Supported: JPG, PNG, GIF • Max size: 5MB</p>
                </div>
              </div>
            </div>

            {/* Product Name Field */}
            <div>
              <label htmlFor="productName" className="block text-sm font-semibold text-gray-700 mb-2">
                <ShoppingBagIcon className="w-4 h-4 inline mr-2" />
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 ${
                  errors.productName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.productName && (
                <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
              )}
            </div>

            {/* Price Field */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 ${
                    errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 resize-none ${
                  errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product description..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
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
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className={`flex-1 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 ${
                    errors.stockQuantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                />
                
                {/* Unit Selection Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUnitPopup(true)}
                    className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 flex items-center space-x-2 min-w-[100px]"
                  >
                    <span className="text-sm font-medium">
                      {units.find(u => u.value === formData.unit)?.label.split('(')[1]?.replace(')', '') || formData.unit}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {errors.stockQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Add Product & Continue</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              
              {/* Skip Button */}
              <button
                type="button"
                onClick={handleSkip}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
              >
                <span>Skip for Now & Go to Profile</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                You can add more products later from your profile dashboard
              </p>
            </div>
          </form>
        </div>

        {/* Back Navigation */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">Back to Factory Details</span>
          </button>
        </div>
      </div>

      {/* Unit Selection Popup */}
      {showUnitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Popup Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Unit</h3>
              <button
                onClick={() => setShowUnitPopup(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition duration-200"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Units List */}
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
                        onClick={() => handleUnitSelect(unit.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center justify-between hover:bg-purple-50 ${
                          formData.unit === unit.value
                            ? 'bg-purple-100 border border-purple-200 text-purple-800'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{unit.label}</span>
                        {formData.unit === unit.value && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Popup Footer */}
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

export default ProductDetailsPage;
