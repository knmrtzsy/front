import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function DersList() {
  const [dersler, setDersler] = useState([]);
  const [yeniIsim, setYeniIsim] = useState('');

  useEffect(() => {
    api.get('/dersler').then(r => setDersler(r.data));
  }, []);

  const ekle = async () => {
    if (!yeniIsim.trim()) return;
    const { data } = await api.post('/dersler', { name: yeniIsim });
    setDersler(prev => [...prev, data]);
    setYeniIsim('');
  };

  const sil = async (id) => {
    await api.delete(`/dersler/${id}`);
    setDersler(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div>
      <h2>Dersler</h2>
      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder="Yeni ders adı"
          value={yeniIsim}
          onChange={e => setYeniIsim(e.target.value)}
        />
        <button className="btn btn-primary" onClick={ekle}>Ekle</button>
      </div>
      <ul className="list-group">
        {dersler.map(d => (
          <li key={d.id} className="list-group-item d-flex justify-content-between">
            {d.name}
            <div>
              <Link to={`/dersler/${d.id}/edit`} className="btn btn-sm btn-secondary me-2">
                Düzenle
              </Link>
              <button onClick={() => sil(d.id)} className="btn btn-sm btn-danger">
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
