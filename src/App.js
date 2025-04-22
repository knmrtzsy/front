import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import SinifList from './pages/SinifList';
import SinifEdit from './pages/SinifEdit';
import OgretmenList from './pages/OgretmenList';
import OgretmenEdit from './pages/OgretmenEdit';
import DersList from './pages/DersList';
import DersEdit from './pages/DersEdit';
import Zamanlama from './pages/Zamanlama';

function App() {
  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <Routes>
          {/* Anasayfaya yönlendirme, burada '/siniflar' adresine yönlendiriyor */}
          <Route path="/" element={<Navigate to="/siniflar" />} />

          {/* Sayfa yönlendirmeleri */}
          <Route path="/siniflar" element={<SinifList />} />
          <Route path="/siniflar/:id/edit" element={<SinifEdit />} />
          <Route path="/ogretmenler" element={<OgretmenList />} />
          <Route path="/ogretmenler/:id/edit" element={<OgretmenEdit />} />
          <Route path="/dersler" element={<DersList />} />
          <Route path="/dersler/:id/edit" element={<DersEdit />} />
          <Route path="/zamanlama" element={<Zamanlama />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
