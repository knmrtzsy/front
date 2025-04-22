import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function SinifList() {
  const [siniflar, setSiniflar] = useState([]);
  const [yeniIsim, setYeniIsim] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/siniflar')
      .then(r => setSiniflar(r.data))
      .catch(err => {
        console.error("Sınıflar yüklenirken hata:", err);
        setError('Sınıflar yüklenirken hata oluştu.');
      });
  }, []);

  const ekle = async () => {
    if (!yeniIsim.trim()) return;
    try {
      const { data } = await api.post('/siniflar', { name: yeniIsim });
      setSiniflar(prev => [...prev, data]);
      setYeniIsim('');
    } catch (err) {
      console.error("Sınıf eklenirken hata:", err);
      setError('Sınıf eklenirken hata oluştu.');
    }
  };

  const sil = async (id) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;
    await api.delete(`/siniflar/${id}`);
    setSiniflar(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div>
      <h2>Sınıflar</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder="Yeni sınıf adı"
          value={yeniIsim}
          onChange={e => setYeniIsim(e.target.value)}
        />
        <button className="btn btn-primary" onClick={ekle}>Ekle</button>
      </div>

      <ul className="list-group">
        {siniflar.map(s => (
          <li key={s.id} className="list-group-item d-flex justify-content-between">
            {s.name}
            <div>
              <Link to={`/siniflar/${s.id}/edit`} className="btn btn-sm btn-secondary me-2">
                Düzenle
              </Link>
              <button onClick={() => sil(s.id)} className="btn btn-sm btn-danger">
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
)}
