import React, { useState, useEffect } from 'react';
import SellerLoginPage from './components/SellerLoginPage';
import FactoryDetailsWithLocation from './components/FactoryDetailsWithLocation';
import ProductDetailsPage from './components/ProductDetailsPage';
import SellerProfilePage from './components/SellerProfilePage';

const App = () => {
  const [currentStep, setCurrentStep] = useState('login');
  const [sellerData, setSellerData] = useState(null);
  const [factoryData, setFactoryData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Base URL - Update this to your backend URL
  const API_BASE_URL = 'https://vend-sell.onrender.com/';

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = localStorage.getItem('authToken');
    const sellerId = localStorage.getItem('sellerId');
    
    if (token && sellerId) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}seller/${sellerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Session check response:', data); // Debug log
          if (data.seller) {
            setSellerData(data.seller);
            setFactoryData(data.factory || null);
            setProductData(data.products || []);
            setCurrentStep('profile');
          } else {
            throw new Error('Invalid response structure: missing seller data');
          }
        } else {
          console.warn('Session check failed with status:', response.status);
          localStorage.removeItem('authToken');
          localStorage.removeItem('sellerId');
        }
      } catch (error) {
        console.error('Session check failed:', error.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('sellerId');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogin = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}seller/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data }); // Debug log

      if (response.ok || response.status === 201) {
        // Check if response contains expected data
        if (data.token && data.seller?.id) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('sellerId', data.seller.id);
          setSellerData(data.seller);
          
          if (data.factory) {
            setFactoryData(data.factory);
            if (data.products && data.products.length > 0) {
              setProductData(data.products);
              setCurrentStep('profile');
            } else {
              setCurrentStep('products');
            }
          } else {
            setCurrentStep('factory');
          }
        } else {
          setError('Invalid response: missing token or seller ID');
        }
      } else {
        setError(data.message || `Login failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message || 'Network error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFactoryComplete = async (factory) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}factory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...factory,
          sellerId: sellerData.id
        })
      });

      const data = await response.json();
      console.log('Factory response:', { status: response.status, data }); // Debug log

      if (response.ok || response.status === 201) {
        if (data.factory) {
          setFactoryData(data.factory);
          setCurrentStep('products');
        } else {
          setError('Invalid response: missing factory data');
        }
      } else {
        setError(data.message || `Failed to save factory details: status ${response.status}`);
      }
    } catch (error) {
      console.error('Factory save error:', error.message);
      setError(error.message || 'Network error during factory save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductComplete = async (product) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      Object.keys(product).forEach(key => {
        if (key === 'productImage' && product[key]) {
          formData.append('productImage', product[key]);
        } else if (key !== 'productImage') {
          formData.append(key, product[key]);
        }
      });
      
      formData.append('sellerId', sellerData.id);
      formData.append('factoryId', factoryData.id);

      const response = await fetch(`${API_BASE_URL}products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Product response:', { status: response.status, data }); // Debug log

      if (response.ok || response.status === 201) {
        if (data.product) {
          setProductData(prev => [...prev, data.product]);
          setCurrentStep('profile');
        } else {
          setError('Invalid response: missing product data');
        }
      } else {
        setError(data.message || `Failed to save product: status ${response.status}`);
      }
    } catch (error) {
      console.error('Product save error:', error.message);
      setError(error.message || 'Network error during product save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProducts = () => {
    setCurrentStep('profile');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        const token = localStorage.getItem('authToken');
        
        await fetch(`${API_BASE_URL}seller/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error.message);
      } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('sellerId');
        setSellerData(null);
        setFactoryData(null);
        setProductData([]);
        setCurrentStep('login');
        setError(null);
      }
    }
  };

  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
              <p className="text-gray-600">Please wait while we load your data</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null); // Clear error
                  if (currentStep === 'login') {
                    setCurrentStep('login');
                  } else if (currentStep === 'factory' && sellerData) {
                    setCurrentStep('factory');
                  } else if (currentStep === 'products' && factoryData) {
                    setCurrentStep('products');
                  } else if (currentStep === 'profile' && sellerData) {
                    setCurrentStep('profile');
                  } else {
                    window.location.reload(); // Fallback to reload if state is inconsistent
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'login':
        return <SellerLoginPage onLogin={handleLogin} />;
      
      case 'factory':
        return (
          <FactoryDetailsWithLocation 
            onComplete={handleFactoryComplete}
            sellerData={sellerData}
          />
        );
      
      case 'products':
        return (
          <ProductDetailsPage 
            onComplete={handleProductComplete}
            onSkip={handleSkipProducts}
            sellerData={sellerData}
            factoryData={factoryData}
          />
        );
      
      case 'profile':
        return (
          <SellerProfilePage 
            sellerData={sellerData}
            factoryData={factoryData}
            initialProducts={productData}
            onLogout={handleLogout}
            apiBaseUrl={API_BASE_URL}
          />
        );
      
      default:
        return <SellerLoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentStep()}
    </div>
  );
};

export default App;