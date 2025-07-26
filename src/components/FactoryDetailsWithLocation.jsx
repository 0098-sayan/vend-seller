import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const FactoryDetailsWithLocation = ({ onComplete, sellerData }) => {
  const [formData, setFormData] = useState({
    name: '',
    factoryType: '',
    contactNumber: sellerData?.phoneNumber || '', // Pre-fill from login data
    address: ''
  });

  const [locationState, setLocationState] = useState({
    loading: false,
    error: null,
    coordinates: null,
    permission: null
  });

  const [errors, setErrors] = useState({});

  // Check geolocation permission on component mount
  useEffect(() => {
    checkLocationPermission();
    // Pre-fill name if available from seller data
    if (sellerData?.name) {
      setFormData(prev => ({ ...prev, name: sellerData.name }));
    }
  }, [sellerData]);

  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationState(prev => ({ ...prev, permission: permission.state }));
        
        // Listen for permission changes
        permission.onchange = () => {
          setLocationState(prev => ({ ...prev, permission: permission.state }));
        };
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "An unknown error occurred";
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Using only Nominatim for reverse geocoding
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SellerApp/1.0' // Required by Nominatim
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      } else {
        throw new Error('No address found for these coordinates');
      }
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      throw new Error('Failed to get address. Please enter manually.');
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get current position
      const coordinates = await getCurrentLocation();
      setLocationState(prev => ({ ...prev, coordinates }));

      // Use Nominatim for reverse geocoding
      const address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
      
      // Update form data
      setFormData(prev => ({ ...prev, address }));
      
      setLocationState(prev => ({ ...prev, loading: false }));
      
    } catch (error) {
      console.error('Location error:', error);
      setLocationState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Factory name is required';
    }
    
    if (!formData.factoryType) {
      newErrors.factoryType = 'Factory type is required';
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Factory Data:', formData);
      console.log('Location Data:', locationState.coordinates);
      
      // Prepare complete factory data
      const completeFactoryData = {
        ...formData,
        coordinates: locationState.coordinates,
        sellerInfo: sellerData // Include seller info from login
      };
      
      // Call onComplete to move to next step
      if (onComplete) {
        onComplete(completeFactoryData);
      } else {
        alert('Factory details saved successfully!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Factory Details</h1>
          <p className="text-gray-600 mb-4">Tell us about your business</p>
          
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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span className="text-xs text-blue-600 font-medium ml-1">Factory</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">3</span>
              </div>
              <span className="text-xs text-gray-500 ml-1">Products</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">4</span>
              </div>
              <span className="text-xs text-gray-500 ml-1">Profile</span>
            </div>
          </div>

          {/* Welcome message with seller name */}
          {sellerData?.name && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                Welcome, <span className="font-semibold">{sellerData.name}</span>! 
                Let's set up your factory details.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Factory/Business Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your factory/business name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Factory Type Field */}
            <div>
              <label htmlFor="factoryType" className="block text-sm font-semibold text-gray-700 mb-2">
                <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                Business Type
              </label>
              <select
                id="factoryType"
                name="factoryType"
                value={formData.factoryType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.factoryType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select business type</option>
                <option value="factory">Factory</option>
                <option value="shop">Shop</option>
                <option value="warehouse">Warehouse</option>
              </select>
              {errors.factoryType && (
                <p className="mt-1 text-sm text-red-600">{errors.factoryType}</p>
              )}
            </div>

            {/* Contact Number Field */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                <PhoneIcon className="w-4 h-4 inline mr-2" />
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.contactNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter business contact number"
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
              )}
              {sellerData?.phoneNumber && formData.contactNumber === sellerData.phoneNumber && (
                <p className="mt-1 text-sm text-green-600">Using your login phone number</p>
              )}
            </div>

            {/* Address Field with Location Detection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-2" />
                Business Address
              </label>
              
              <div className="space-y-3">
                {/* Address Input */}
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition duration-200 ${
                    errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business address manually or use current location"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}

                {/* Location Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationState.loading}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    locationState.loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                  }`}
                >
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  {locationState.loading ? 'Getting Location...' : 'Use Current Location'}
                </button>

                {/* Location Status/Error Display */}
                {locationState.error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{locationState.error}</p>
                  </div>
                )}

                {/* Coordinates Display (for debugging) */}
                {locationState.coordinates && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700">
                      📍 Location captured: {locationState.coordinates.latitude.toFixed(6)}, 
                      {locationState.coordinates.longitude.toFixed(6)}
                      {locationState.coordinates.accuracy && 
                        ` (±${Math.round(locationState.coordinates.accuracy)}m accuracy)`
                      }
                    </p>
                  </div>
                )}

                {/* Permission Status */}
                {locationState.permission === 'denied' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Location access is blocked. Please enable location permissions in your browser settings to use automatic location detection.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Continue to Products</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                This information will be displayed on your seller profile
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FactoryDetailsWithLocation;
