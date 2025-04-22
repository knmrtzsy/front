import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function OgretmenEdit() {
  const { id } = useParams();
  const [assigned, setAssigned] = useState([]);
  const [dersList, setDersList] = useState([]);
  const [seciliDers, setSeciliDers] = useState('');

  const fetchData = async () => {
    try {
      const [{ data: allD }, { data: sub }] = await Promise.all([
        api.get('/dersler'),
        api.get(`/atamalar/teacher-subject?teacher_id=${id}`)
      ]);
      setDersList(allD);
      setAssigned(sub);
    } catch (error) {
      console.error("Veri alınırken hata:", error);
      alert("Dersler veya atamalar yüklenirken hata oluştu.");
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const ekle = async () => {
    if (!seciliDers) return alert("Lütfen bir ders seçin.");
    try {
      await api.post('/atamalar/teacher-subject', {
        teacher_id: id,
        subject_id: seciliDers
      });
      fetchData();
    } catch (error) {
      console.error("Ders eklenirken hata:", error);
      alert("Ders eklenirken hata oluştu.");
    }
  };

  const cikar = async (subject_id) => {
    try {
      await api.delete('/atamalar/teacher-subject', {
        data: { teacher_id: id, subject_id }
      });
      fetchData();
    } catch (error) {
      console.error("Ders çıkarılırken hata:", error);
      alert("Ders çıkarılırken hata oluştu.");
    }
  };

  return (
    <div>
      <h2>Öğretmen Düzenle</h2>

      <select
        className="form-select mb-2"
        value={seciliDers}
        onChange={e => setSeciliDers(e.target.value)}
      >
        <option value="">Ders seç</option>
        {dersList.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <button
        className="btn btn-primary mb-3"
        onClick={ekle}
        disabled={!seciliDers}
      >
        Ekle
      </button>

      <ul className="list-group">
        {assigned.length > 0 ? assigned.map(d => (
          <li key={d.subject_id} className="list-group-item d-flex justify-content-between">
            {d.name}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => cikar(d.subject_id)}
            >
              Çıkar
            </button>
          </li>
        )) : (
          <li className="list-group-item">Henüz atanmış ders yok.</li>
        )}
      </ul>
    </div>
  );
}
