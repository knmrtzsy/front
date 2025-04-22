import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function DersEdit() {
  const { id } = useParams();
  const [assigned, setAssigned] = useState([]);
  const [ogretmenList, setOgretmenList] = useState([]);
  const [seciliOgretmen, setSeciliOgretmen] = useState('');

  const fetchData = async () => {
    try {
      const [{ data: allO }, { data: sub }] = await Promise.all([
        api.get('/ogretmenler'),
        api.get(`/atamalar/subject-teacher?subject_id=${id}`)
      ]);
      setOgretmenList(allO);
      setAssigned(sub);
    } catch (error) {
      console.error("Veri alınırken hata oluştu:", error);
      alert("Öğretmenler veya atamalar yüklenirken bir hata oluştu.");
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const ekle = async () => {
    if (!seciliOgretmen) return alert("Lütfen bir öğretmen seçin.");
    try {
      await api.post('/atamalar/teacher-subject', {
        teacher_id: seciliOgretmen,
        subject_id: id
      });
      fetchData();
    } catch (error) {
      console.error("Öğretmen eklenirken hata:", error);
      alert("Öğretmen eklenirken bir hata oluştu.");
    }
  };

  const cikar = async (teacher_id) => {
    try {
      await api.delete('/atamalar/teacher-subject', {
        data: { teacher_id, subject_id: id }
      });
      fetchData();
    } catch (error) {
      console.error("Öğretmen çıkarılırken hata:", error);
      alert("Öğretmen çıkarılırken bir hata oluştu.");
    }
  };

  return (
    <div>
      <h2>Ders Düzenle</h2>

      <select
        className="form-select mb-2"
        value={seciliOgretmen}
        onChange={e => setSeciliOgretmen(e.target.value)}
      >
        <option value="">Öğretmen seç</option>
        {ogretmenList.map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <button
        className="btn btn-primary mb-3"
        onClick={ekle}
        disabled={!seciliOgretmen}
      >
        Ekle
      </button>

      <ul className="list-group">
        {assigned.length > 0 ? assigned.map(o => (
          <li key={o.teacher_id} className="list-group-item d-flex justify-content-between">
            {o.name}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => cikar(o.teacher_id)}
            >
              Çıkar
            </button>
          </li>
        )) : (
          <li className="list-group-item">Henüz atanmış öğretmen yok.</li>
        )}
      </ul>
    </div>
  );
}
