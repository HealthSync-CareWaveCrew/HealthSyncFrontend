import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
  clearSuccess,
  clearError,
} from '../Redux/Features/diseaseSlice';
import PopupModal from './PopupModal';
import { FiFileText, FiImage } from 'react-icons/fi';

function DiseaseManagement() {
  const dispatch = useDispatch();
  const { diseases, loading, error, success } = useSelector((state) => state.disease);
  const formRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    predictionType: 'text',
    description: '',
    fields: [],
    aboutDiseaseItems: [],
  });
  const [currentFieldInput, setCurrentFieldInput] = useState({
    name: '',
    label: '',
    type: 'text',
    options: '',
    required: true,
  });
  const [currentAboutDiseaseInput, setCurrentAboutDiseaseInput] = useState({
    heading: '',
    description: '',
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editingAboutIndex, setEditingAboutIndex] = useState(null);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
  });
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const openPopup = (type, title, message) => {
    setPopupState({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopupState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    dispatch(fetchAllDiseases());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFieldInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFieldInput((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAboutDiseaseInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAboutDiseaseInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addOrUpdateField = () => {
    if (!currentFieldInput.name || !currentFieldInput.label) {
      openPopup('alert', 'Missing Details', 'Please fill in field name and label.');
      return;
    }

    // Trim whitespace from name and label
    const trimmedName = currentFieldInput.name.trim();
    const trimmedLabel = currentFieldInput.label.trim();

    // Check for empty after trimming
    if (!trimmedName || !trimmedLabel) {
      openPopup('alert', 'Invalid Input', 'Field name and label cannot be empty or contain only whitespace.');
      return;
    }

    // Check for duplicate field names (excluding current field if editing)
    const isDuplicate = formData.fields.some((field, index) => {
      if (editingFieldIndex !== null && index === editingFieldIndex) {
        return false; // Skip the field being edited
      }
      return field.name.trim().toLowerCase() === trimmedName.toLowerCase();
    });

    if (isDuplicate) {
      openPopup('alert', 'Duplicate Field', `A field with the name "${trimmedName}" already exists. Please use a unique field name.`);
      return;
    }

    const newField = {
      name: trimmedName,
      label: trimmedLabel,
      type: currentFieldInput.type,
      required: currentFieldInput.required,
    };

    if (['select', 'radio', 'checkbox'].includes(currentFieldInput.type)) {
      if (!currentFieldInput.options.trim()) {
        openPopup('alert', 'Missing Options', 'Please enter options for this field type.');
        return;
      }
      newField.options = currentFieldInput.options.split(',').map((opt) => opt.trim());
    }

    setFormData((prev) => {
      if (editingFieldIndex !== null) {
        return {
          ...prev,
          fields: prev.fields.map((field, index) =>
            index === editingFieldIndex ? newField : field
          ),
        };
      }

      return {
        ...prev,
        fields: [...prev.fields, newField],
      };
    });

    setEditingFieldIndex(null);

    setCurrentFieldInput({
      name: '',
      label: '',
      type: 'text',
      options: '',
      required: true,
    });
  };

  const removeField = (index) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));

    if (editingFieldIndex === index) {
      setEditingFieldIndex(null);
      setCurrentFieldInput({
        name: '',
        label: '',
        type: 'text',
        options: '',
        required: true,
      });
    } else if (editingFieldIndex !== null && index < editingFieldIndex) {
      setEditingFieldIndex((prev) => prev - 1);
    }
  };

  const editField = (index) => {
    const field = formData.fields[index];
    setEditingFieldIndex(index);
    setCurrentFieldInput({
      name: field.name || '',
      label: field.label || '',
      type: field.type || 'text',
      options: Array.isArray(field.options) ? field.options.join(', ') : '',
      required: field.required !== undefined ? field.required : true,
    });
  };

  const cancelFieldEdit = () => {
    setEditingFieldIndex(null);
    setCurrentFieldInput({
      name: '',
      label: '',
      type: 'text',
      options: '',
      required: true,
    });
  };

  const addOrUpdateAboutDiseaseItem = () => {
    if (!currentAboutDiseaseInput.heading || !currentAboutDiseaseInput.description) {
      openPopup('alert', 'Missing Details', 'Please fill in heading and description.');
      return;
    }

    // Trim whitespace from heading and description
    const trimmedHeading = currentAboutDiseaseInput.heading.trim();
    const trimmedDescription = currentAboutDiseaseInput.description.trim();

    // Check for empty after trimming
    if (!trimmedHeading || !trimmedDescription) {
      openPopup('alert', 'Invalid Input', 'Heading and description cannot be empty or contain only whitespace.');
      return;
    }

    const newItem = {
      heading: trimmedHeading,
      description: trimmedDescription,
    };

    setFormData((prev) => {
      if (editingAboutIndex !== null) {
        return {
          ...prev,
          aboutDiseaseItems: prev.aboutDiseaseItems.map((item, index) =>
            index === editingAboutIndex ? newItem : item
          ),
        };
      }

      return {
        ...prev,
        aboutDiseaseItems: [...prev.aboutDiseaseItems, newItem],
      };
    });

    setEditingAboutIndex(null);

    setCurrentAboutDiseaseInput({
      heading: '',
      description: '',
    });
  };

  const removeAboutDiseaseItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      aboutDiseaseItems: prev.aboutDiseaseItems.filter((_, i) => i !== index),
    }));

    if (editingAboutIndex === index) {
      setEditingAboutIndex(null);
      setCurrentAboutDiseaseInput({ heading: '', description: '' });
    } else if (editingAboutIndex !== null && index < editingAboutIndex) {
      setEditingAboutIndex((prev) => prev - 1);
    }
  };

  const editAboutDiseaseItem = (index) => {
    const item = formData.aboutDiseaseItems[index];
    setEditingAboutIndex(index);
    setCurrentAboutDiseaseInput({
      heading: item.heading || '',
      description: item.description || '',
    });
  };

  const cancelAboutEdit = () => {
    setEditingAboutIndex(null);
    setCurrentAboutDiseaseInput({ heading: '', description: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.predictionType) {
      openPopup('alert', 'Missing Details', 'Please fill in disease name and prediction type.');
      return;
    }

    // For image type, fields should be empty
    const submitData = {
      name: formData.name,
      predictionType: formData.predictionType,
      description: formData.description,
      fields: formData.predictionType === 'image' ? [] : formData.fields,
      aboutDiseaseItems: formData.aboutDiseaseItems,
    };

    if (editingId) {
      dispatch(updateDisease({ diseaseId: editingId, diseaseData: submitData }));
    } else {
      dispatch(createDisease(submitData));
    }

    resetForm();
  };

  const handleEdit = (disease) => {
    setFormData({
      name: disease.name,
      predictionType: disease.predictionType,
      description: disease.description,
      fields: disease.fields || [],
      aboutDiseaseItems: disease.aboutDiseaseItems || [],
    });
    setEditingId(disease.diseaseId);
    setShowForm(true);

    // Scroll to form after state update
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = (diseaseId) => {
    setDeleteTargetId(diseaseId);
    openPopup('confirm', 'Delete Disease', 'Are you sure you want to delete this disease?');
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      dispatch(deleteDisease(deleteTargetId));
    }
    setDeleteTargetId(null);
    closePopup();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      predictionType: 'text',
      description: '',
      fields: [],
      aboutDiseaseItems: [],
    });
    setCurrentAboutDiseaseInput({
      heading: '',
      description: '',
    });
    setCurrentFieldInput({
      name: '',
      label: '',
      type: 'text',
      options: '',
      required: true,
    });
    setEditingFieldIndex(null);
    setEditingAboutIndex(null);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredDiseases = diseases.filter((disease) => {
    if (filterType === 'all') return true;
    return disease.predictionType === filterType;
  });

  if (loading && diseases.length === 0) {
    return (
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-2/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-black">
              Disease Management ({filteredDiseases.length}/{diseases.length})
            </h3>
            <p className="text-black/60 text-sm">
              Manage prediction diseases and their configuration
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-primary-2/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Image Based</option>
              <option value="text">Text Based</option>
            </select>

            {/* Add Button */}
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2 bg-gradient-to-r from-primary-2 to-primary-1 text-white rounded-lg hover:opacity-90 transition font-semibold text-sm"
            >
              + Add Disease
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div ref={formRef} className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-primary-2/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-black">
              {editingId ? 'Edit Disease' : 'Create New Disease'}
            </h4>
            <button
              onClick={resetForm}
              className="text-black/60 hover:text-black text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Disease Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Disease Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Diabetes, Heart Disease"
                  className="w-full px-4 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
                />
              </div>

              {/* Prediction Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Prediction Type *
                </label>
                <select
                  name="predictionType"
                  value={formData.predictionType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white border border-primary-2/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
                >
                  <option value="text">Text Based (Clinical Data)</option>
                  <option value="image">Image Based (Medical Imaging)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Brief description of the disease"
                rows="3"
                className="w-full px-4 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
              />
            </div>

            {/* About Disease Section */}
            <div className="space-y-4 bg-black/5 p-4 rounded-lg">
              <h5 className="font-semibold text-black">About Disease Information</h5>

              {/* Add About Disease Item Form */}
              <div className="space-y-3 bg-white/50 p-3 rounded-lg">
                <input
                  type="text"
                  name="heading"
                  value={currentAboutDiseaseInput.heading}
                  onChange={handleAboutDiseaseInputChange}
                  placeholder="Section heading (e.g., Symptoms, Causes, Risk Factors)"
                  className="w-full px-3 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                />
                <textarea
                  name="description"
                  value={currentAboutDiseaseInput.description}
                  onChange={handleAboutDiseaseInputChange}
                  placeholder="Detailed description for this section"
                  rows="4"
                  className="w-full px-3 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addOrUpdateAboutDiseaseItem}
                  className="w-full py-2 px-3 bg-primary-1 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                >
                  {editingAboutIndex !== null ? 'Update About Section' : 'Add About Section'}
                </button>
                {editingAboutIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelAboutEdit}
                    className="w-full py-2 px-3 bg-black/10 text-black rounded-lg hover:bg-black/20 transition font-medium text-sm"
                  >
                    Cancel About Edit
                  </button>
                )}
              </div>

              {/* Display Added About Disease Items */}
              {formData.aboutDiseaseItems.length > 0 && (
                <div className="space-y-2">
                  <h6 className="font-semibold text-sm text-black">Added Sections:</h6>
                  {formData.aboutDiseaseItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/70 p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h6 className="font-semibold text-black">{item.heading}</h6>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => editAboutDiseaseItem(index)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAboutDiseaseItem(index)}
                            className="text-red-600 hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-black/70 text-sm whitespace-pre-wrap">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fields Section (only for Text-based) */}
            {formData.predictionType === 'text' && (
              <div className="space-y-4 bg-black/5 p-4 rounded-lg">
                <h5 className="font-semibold text-black">Clinical Data Fields</h5>

                {/* Add Field Form */}
                <div className="space-y-3 bg-white/50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="name"
                      value={currentFieldInput.name}
                      onChange={handleFieldInputChange}
                      placeholder="Field name (e.g., age, bloodPressure)"
                      className="px-3 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                    />
                    <input
                      type="text"
                      name="label"
                      value={currentFieldInput.label}
                      onChange={handleFieldInputChange}
                      placeholder="Field label (e.g., Age, Blood Pressure)"
                      className="px-3 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      name="type"
                      value={currentFieldInput.type}
                      onChange={handleFieldInputChange}
                      className="px-3 py-2 bg-white border border-primary-2/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                    </select>

                    {['select', 'radio', 'checkbox'].includes(currentFieldInput.type) && (
                      <input
                        type="text"
                        name="options"
                        value={currentFieldInput.options}
                        onChange={handleFieldInputChange}
                        placeholder="Options (comma-separated)"
                        className="px-3 py-2 bg-white border border-primary-2/30 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="required"
                      checked={currentFieldInput.required}
                      onChange={handleFieldInputChange}
                      id="fieldRequired"
                      className="w-4 h-4"
                    />
                    <label htmlFor="fieldRequired" className="text-sm text-black">
                      Required field
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={addOrUpdateField}
                    className="w-full py-2 px-3 bg-primary-1 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                  >
                    {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                  </button>
                  {editingFieldIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelFieldEdit}
                      className="w-full py-2 px-3 bg-black/10 text-black rounded-lg hover:bg-black/20 transition font-medium text-sm"
                    >
                      Cancel Field Edit
                    </button>
                  )}
                </div>

                {/* Display Added Fields */}
                {formData.fields.length > 0 && (
                  <div className="space-y-2">
                    <h6 className="font-semibold text-sm text-black">Added Fields:</h6>
                    {formData.fields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/70 p-3 rounded-lg"
                      >
                        <div className="text-sm">
                          <span className="font-medium text-black">{field.label}</span>
                          <span className="text-black/60">
                            {' '}
                            ({field.type}
                            {field.required && ', required'}
                            {field.options && `, ${field.options.length} options`})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => editField(index)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="text-red-600 hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-black/10 text-black rounded-lg hover:bg-black/20 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-primary-2 to-primary-1 text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Disease' : 'Create Disease'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Diseases List */}
      <div className="space-y-3">
        {filteredDiseases.length === 0 ? (
          <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-primary-2/30 text-center">
            <p className="text-black/60">No diseases found</p>
          </div>
        ) : (
          filteredDiseases.map((disease) => (
            <div
              key={disease.diseaseId}
              className="bg-primary-4 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-2/30 hover:border-primary-1/50 transition"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-black">{disease.name}</h4>
                    {/* <span className="inline-block px-3 py-1 bg-primary-1/20 text-primary-1 text-xs font-semibold rounded-full">
                      {disease.predictionType === 'image' ? '🖼️ Image' : '📋 Text'}
                    </span> */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-1/20 text-primary-1 text-xs font-semibold rounded-full">
                      {disease.predictionType === "image" ? (
                        <>
                          <FiImage className="text-sm" />
                          Image
                        </>
                      ) : (
                        <>
                          <FiFileText className="text-sm" />
                          Text
                        </>
                      )}
                    </span>
                  </div>
                  {disease.description && (
                    <p className="text-black/60 text-sm mb-2">{disease.description}</p>
                  )}

                  {/* About Disease Items Preview */}
                  {disease.aboutDiseaseItems && disease.aboutDiseaseItems.length > 0 && (
                    <div className="mt-2 bg-primary-2/10 p-2 rounded mb-2">
                      <p className="text-xs font-semibold text-black mb-1">About Disease Sections:</p>
                      {disease.aboutDiseaseItems.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-semibold text-primary-1 text-xs">• {item.heading}</span>
                          <p className="text-black/60 text-xs ml-4 line-clamp-2">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-black/60">
                    <span>ID: {disease.diseaseId}</span>
                    <span>
                      Fields: {disease.fields ? disease.fields.length : 0}
                    </span>
                    <span>
                      About Sections: {disease.aboutDiseaseItems ? disease.aboutDiseaseItems.length : 0}
                    </span>
                    <span>
                      Created: {new Date(disease.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Fields Preview */}
                  {disease.fields && disease.fields.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {disease.fields.map((field, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-black/5 text-black text-xs rounded"
                        >
                          {field.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(disease)}
                    className="px-4 py-2 bg-blue-500/20 text-blue-600 rounded-lg hover:bg-blue-500/30 transition font-semibold text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(disease.diseaseId)}
                    className="px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition font-semibold text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PopupModal
        isOpen={popupState.isOpen}
        type={popupState.type}
        title={popupState.title}
        message={popupState.message}
        onClose={() => {
          setDeleteTargetId(null);
          closePopup();
        }}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default DiseaseManagement;
