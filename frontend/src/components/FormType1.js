import React, { useState } from 'react';
import './Forms.css';

const FormType1 = ({ onFormSubmitted }) => {
  const [formData, setFormData] = useState({
    param1: '',
    param2: '',
    param3: '',
    param4: '',
    param5: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    for (let key in formData) {
      if (formData[key] === '' || isNaN(parseFloat(formData[key]))) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('Lütfen tüm alanları geçerli sayı değerleri ile doldurun.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const submitData = {
        param1: parseFloat(formData.param1),
        param2: parseFloat(formData.param2),
        param3: parseFloat(formData.param3),
        param4: parseFloat(formData.param4),
        param5: parseFloat(formData.param5)
      };

      const response = await fetch('http://localhost:8080/api/forms/type1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus(`Başarılı: Form ID ${result.id} ile kaydedildi`);
        setFormData({
          param1: '',
          param2: '',
          param3: '',
          param4: '',
          param5: ''
        });
        
        // Call the callback after successful submission
        if (onFormSubmitted) {
          setTimeout(() => {
            onFormSubmitted();
          }, 1500); // Give user time to see success message
        }
      } else {
        setSubmitStatus('Hata: Form gönderilemedi.');
      }
    } catch (error) {
      setSubmitStatus(`Bağlantı hatası: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-header">
        <h2>Form Tip 1</h2>
        <p>5 Float Parametre</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="param1">Parametre 1:</label>
            <input
              type="number"
              step="any"
              id="param1"
              name="param1"
              value={formData.param1}
              onChange={handleInputChange}
              placeholder="0.0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="param2">Parametre 2:</label>
            <input
              type="number"
              step="any"
              id="param2"
              name="param2"
              value={formData.param2}
              onChange={handleInputChange}
              placeholder="0.0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="param3">Parametre 3:</label>
            <input
              type="number"
              step="any"
              id="param3"
              name="param3"
              value={formData.param3}
              onChange={handleInputChange}
              placeholder="0.0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="param4">Parametre 4:</label>
            <input
              type="number"
              step="any"
              id="param4"
              name="param4"
              value={formData.param4}
              onChange={handleInputChange}
              placeholder="0.0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="param5">Parametre 5:</label>
            <input
              type="number"
              step="any"
              id="param5"
              name="param5"
              value={formData.param5}
              onChange={handleInputChange}
              placeholder="0.0"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Formu Gönder'}
          </button>
        </div>

        {submitStatus && (
          <div className={`status-message ${submitStatus.includes('Başarılı') ? 'success' : 'error'}`}>
            {submitStatus}
          </div>
        )}
      </form>
    </div>
  );
};

export default FormType1; 