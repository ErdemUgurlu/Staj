import React, { useState, useEffect } from 'react';
import './App.css';
import FormType1 from './components/FormType1';
import FormType2 from './components/FormType2';
import FormList from './components/FormList';
import TurkeyMap from './components/TurkeyMap';

function App() {
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms');
      if (response.ok) {
        const formsData = await response.json();
        setForms(formsData);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleFormSelection = (formType) => {
    setSelectedFormType(formType);
    setShowForm(true);
  };

  const handleBackToSelection = () => {
    setShowForm(false);
    setSelectedFormType(null);
  };

  const handleFormSubmitted = () => {
    // Refresh the form list when a new form is submitted
    fetchForms();
    handleBackToSelection();
  };

  const handleFormDeleted = async () => {
    // Refresh the form list after deletion
    await fetchForms();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Form Management System</h1>
        <p>Dinamik Form Oluşturma ve Gönderme Uygulaması</p>
      </header>

      <main className="App-main">
        {!showForm ? (
          <div className="main-content">
            <div className="form-selection">
              <h2>Yeni Form Oluştur</h2>
              <p>Lütfen oluşturmak istediğiniz form tipini seçin:</p>
              
              <div className="form-type-buttons">
                <button 
                  className="form-type-btn type1"
                  onClick={() => handleFormSelection('type1')}
                >
                  <h3>Form Tip 1</h3>
                  <p>5 Float Parametre</p>
                  <div className="param-list">
                    <span>param1, param2, param3, param4, param5</span>
                  </div>
                </button>

                <button 
                  className="form-type-btn type2"
                  onClick={() => handleFormSelection('type2')}
                >
                  <h3>Form Tip 2</h3>
                  <p>3 Float Parametre</p>
                  <div className="param-list">
                    <span>param1, param2, param3</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="form-list-section">
              <h2>Gönderilen Formlar</h2>
              {loading ? (
                <p>Formlar yükleniyor...</p>
              ) : (
                <FormList forms={forms} onFormDeleted={handleFormDeleted} />
              )}
            </div>

            <TurkeyMap />
          </div>
        ) : (
          <div className="form-container">
            <button className="back-btn" onClick={handleBackToSelection}>
              ← Geri Dön
            </button>
            
            {selectedFormType === 'type1' && <FormType1 onFormSubmitted={handleFormSubmitted} />}
            {selectedFormType === 'type2' && <FormType2 onFormSubmitted={handleFormSubmitted} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
