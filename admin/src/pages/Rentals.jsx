import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ClipboardDocumentListIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    engine: '',
    fuel: '',
    topSpeed: '',
    color: '',
    description: '',
    image: [],
    availableDate: '',
    pricePerDay: ''
  });

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path (starts with /uploads), prepend server URL
    if (imagePath.startsWith('/uploads')) {
      const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${serverUrl}${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path and return as is
    return imagePath;
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await apiService.rentals.getAll();
      setRentals(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields before sending
    if (!formData.name || !formData.brand || !formData.model || 
        !formData.engine || !formData.fuel || !formData.topSpeed || 
        !formData.color || !formData.availableDate || !formData.pricePerDay) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const rentalData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        engine: formData.engine.trim(),
        fuel: formData.fuel,
        topSpeed: parseInt(formData.topSpeed),
        color: formData.color.trim(),
        description: formData.description.trim(),
        image: formData.image.length > 0 ? formData.image[0] : '',
        availableDate: formData.availableDate,
        pricePerDay: parseFloat(formData.pricePerDay)
      };

      console.log('Sending rental data:', rentalData);
      console.log('Auth token:', localStorage.getItem('adminToken'));

      if (editingRental) {
        await apiService.rentals.update(editingRental._id, rentalData);
        alert('Car updated successfully!');
      } else {
        await apiService.rentals.create(rentalData);
        alert('Car added successfully!');
      }
      fetchRentals();
      resetForm();
    } catch (error) {
      console.error('Error saving car:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error saving car';
      
      // Show detailed validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        alert(`Validation Error: ${validationErrors}`);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleEdit = (rental) => {
    setEditingRental(rental);
    setFormData({
      name: rental.name || '',
      brand: rental.brand || '',
      model: rental.model || '',
      engine: rental.engine || '',
      fuel: rental.fuel || '',
      topSpeed: rental.topSpeed ? rental.topSpeed.toString() : '',
      color: rental.color || '',
      description: rental.description || '',
      image: rental.image ? [rental.image] : [],
      availableDate: rental.availableDate ? new Date(rental.availableDate).toISOString().split('T')[0] : '',
      pricePerDay: rental.pricePerDay ? rental.pricePerDay.toString() : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rental?')) {
      try {
        await apiService.rentals.delete(id);
        fetchRentals();
      } catch (error) {
        console.error('Error deleting rental:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      engine: '',
      fuel: '',
      topSpeed: '',
      color: '',
      description: '',
      image: [],
      availableDate: '',
      pricePerDay: ''
    });
    setEditingRental(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Cars Management</h1>
          <p className="text-gray-600">Manage available cars for rental with pricing and availability</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Available Car
        </button>
      </div>

      {/* Available Cars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rentals.map((rental) => (
          <div key={rental._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Car Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rental.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {rental.brand} {rental.model}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rental.engine} • {rental.fuel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    ${rental.pricePerDay}
                  </span>
                  <p className="text-xs text-gray-500">per day</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">
                  Available from: {new Date(rental.availableDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Car Content */}
            <div className="p-6">
              {/* Car Specifications */}
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Specifications</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Engine:</span>
                    <span className="font-medium">{rental.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Type:</span>
                    <span className="font-medium">{rental.fuel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Speed:</span>
                    <span className="font-medium">{rental.topSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color:</span>
                    <span className="font-medium">{rental.color}</span>
                  </div>
                </div>
              </div>

              {/* Description Preview */}
              {rental.description && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Description:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded line-clamp-2">
                    {rental.description}
                  </p>
                </div>
              )}

              {/* Car Image Preview */}
              {rental.image && (
                <div className="mb-4">
                  <img 
                    src={getImageUrl(rental.image)} 
                    alt={rental.name}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(rental)}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rental._id)}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rentals.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No available cars yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first available car for rental</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Available Car
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRental ? 'Edit Available Car' : 'Add Available Car'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Car Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toyota Camry Hybrid"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toyota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Camry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine *
                  </label>
                  <input
                    type="text"
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2.5L Hybrid"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type *
                  </label>
                  <select
                    value={formData.fuel}
                    onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top Speed (km/h) *
                  </label>
                  <input
                    type="number"
                    value={formData.topSpeed}
                    onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="180"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pearl White"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Day ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Date *
                  </label>
                  <input
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Image
                  </label>
                  <ImageUpload
                    images={formData.image}
                    onImagesChange={(images) => setFormData({ ...formData, image: images })}
                    maxImages={1}
                    type="rentals"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the car features, comfort, and appeal..."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRental ? 'Update' : 'Create'} Car
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;