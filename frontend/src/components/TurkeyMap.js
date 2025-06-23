import React from 'react';
import './TurkeyMap.css';

const TurkeyMap = () => {
  return (
    <div className="turkey-map-container">
      <h2>Türkiye Fiziki Haritası</h2>
      <img 
        src={process.env.PUBLIC_URL + '/images/turkey_topo.jpg'}
        alt="Türkiye Fiziki Haritası"
        className="turkey-map"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/4/49/Turkey_topo.jpg";
        }}
      />
    </div>
  );
};

export default TurkeyMap; 