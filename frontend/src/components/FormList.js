import React from 'react';
import './FormList.css';

const FormList = ({ forms, onFormDeleted }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatFormData = (formData) => {
    if (!formData) return '';
    
    const entries = Object.entries(formData);
    return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
  };

  const handleDelete = async (formId) => {
    if (window.confirm('Bu formu silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/forms/${formId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Call the callback to refresh the list
          if (onFormDeleted) {
            onFormDeleted();
          }
        } else {
          alert('Form silinirken hata oluştu.');
        }
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Form silinirken hata oluştu.');
      }
    }
  };

  const getFormTypeDisplayName = (formType) => {
    switch (formType) {
      case 'FormType1':
        return 'Form Tip 1 (5 Parametre)';
      case 'FormType2':
        return 'Form Tip 2 (3 Parametre)';
      default:
        return formType;
    }
  };

  const getFormTypeClass = (formType) => {
    return formType === 'FormType1' ? 'type1' : 'type2';
  };

  if (forms.length === 0) {
    return (
      <div className="form-list-empty">
        <p>Henüz gönderilmiş form bulunmuyor.</p>
        <p>Yukarıdaki butonları kullanarak yeni form oluşturabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="form-list">
      <div className="form-count">
        Toplam {forms.length} form gönderildi
      </div>
      
      <div className="form-grid">
        {forms.map((form) => (
          <div key={form.id} className={`form-card ${getFormTypeClass(form.formType)}`}>
            <div className="form-card-header">
              <h3 className="form-type">{getFormTypeDisplayName(form.formType)}</h3>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(form.id)}
                title="Formu sil"
              >
                ×
              </button>
            </div>
            
            <div className="form-card-body">
              <div className="form-data">
                <strong>Veriler:</strong>
                <div className="form-params">
                  {formatFormData(form.formData)}
                </div>
              </div>
              
              <div className="form-meta">
                <div className="form-date">
                  <strong>Gönderim:</strong> {formatDate(form.submittedAt)}
                </div>
                <div className="form-status">
                  <span className={`status-badge ${form.status}`}>
                    {form.status === 'submitted' ? 'Gönderildi' : form.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="form-card-footer">
              <small className="form-id">ID: {form.id}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormList; 