import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Zamanlama() {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    class_id: '',
    teacher_id: '',
    subject_id: '',
    day_of_week: '',
    slot: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/timetables'),
      api.get('/siniflar'),
      api.get('/ogretmenler'),
      api.get('/dersler')
    ]).then(([t, c, te, s]) => {
      setEntries(t.data);
      setClasses(c.data);
      setTeachers(te.data);
      setSubjects(s.data);
    });
  }, []);

  const ekle = async () => {
    try {
      await api.post('/atamalar/timetable', form);
      const { data } = await api.get('/timetables');
      setEntries(data);
      setForm({ class_id: '', teacher_id: '', subject_id: '', day_of_week: '', slot: '' });
    } catch (error) {
      console.error("Zamanlama eklenirken hata:", error);
      alert("Zamanlama eklenirken bir hata oluştu.");
    }
  };

  return (
    <div>
      <h2>Ders Zamanlaması</h2>

      <div className="row mb-3">
        <div className="col"><label>Sınıf</label>
          <select className="form-select" value={form.class_id}
            onChange={e => setForm({ ...form, class_id: e.target.value })}>
            <option value="">Seçiniz</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col"><label>Ders</label>
          <select className="form-select" value={form.subject_id}
            onChange={e => setForm({ ...form, subject_id: e.target.value })}>
            <option value="">Seçiniz</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col"><label>Öğretmen</label>
          <select className="form-select" value={form.teacher_id}
            onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
            <option value="">Seçiniz</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col"><label>Gün</label>
          <select className="form-select" value={form.day_of_week}
            onChange={e => setForm({ ...form, day_of_week: e.target.value })}>
            <option value="">Seçiniz</option>
            {["Pazartesi","Salı","Çarşamba","Perşembe","Cuma"].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div className="col"><label>Slot</label>
          <input className="form-control" type="text" value={form.slot}
            onChange={e => setForm({ ...form, slot: e.target.value })} />
        </div>
        <div className="col d-flex align-items-end">
          <button className="btn btn-primary" onClick={ekle}>Ekle</button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Sınıf</th><th>Ders</th><th>Öğretmen</th><th>Gün</th><th>Slot</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? entries.map(e => (
            <tr key={e.id}>
              <td>{e.class}</td>
              <td>{e.subject}</td>
              <td>{e.teacher}</td>
              <td>{e.day_of_week}</td>
              <td>{e.slot}</td>
            </tr>
          )) : (
            <tr><td colSpan="5">Veri bulunamadı</td></tr>
          )}
        </tbody>
      </table>
    </div>
)}
