import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function OgretmenList() {
  const [ogretmenler, setOgretmenler] = useState([]);
  const [yeniIsim, setYeniIsim] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/ogretmenler')
      .then(r => setOgretmenler(r.data))
      .catch(err => {
        console.error('Öğretmenler yüklenirken hata:', err);
        setError('Öğretmenler yüklenirken hata oluştu.');
      });
  }, []);

  const ekle = async () => {
    if (!yeniIsim.trim()) return;
    try {
      const { data } = await api.post('/ogretmenler', { name: yeniIsim });
      setOgretmenler(prev => [...prev, data]);
      setYeniIsim('');
    } catch (err) {
      console.error('Öğretmen eklenirken hata:', err);
      setError('Öğretmen eklenirken hata oluştu.');
    }
  };

  const sil = async (id) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/ogretmenler/${id}`);
      setOgretmenler(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Öğretmen silinirken hata:', err);
      setError('Öğretmen silinirken hata oluştu.');
    }
  };

  return (
    <div>
      <h2>Öğretmenler</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder="Yeni öğretmen adı"
          value={yeniIsim}
          onChange={e => setYeniIsim(e.target.value)}
        />
        <button className="btn btn-primary" onClick={ekle}>Ekle</button>
      </div>

      <ul className="list-group">
        {ogretmenler.length > 0 ? ogretmenler.map(o => (
          <li key={o.id} className="list-group-item d-flex justify-content-between">
            {o.name}
            <div>
              <Link to={`/ogretmenler/${o.id}/edit`} className="btn btn-sm btn-secondary me-2">
                Düzenle
              </Link>
              <button onClick={() => sil(o.id)} className="btn btn-sm btn-danger">
                Sil
              </button>
            </div>
          </li>
        )) : (
          <li className="list-group-item">Henüz öğretmen bulunmamaktadır.</li>
        )}
      </ul>
    </div>
  );
}
