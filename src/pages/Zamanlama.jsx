import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';

export default function Zamanlama() {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    class_id: '',
    teacher_id: '',
    subject_id: '',
    day_of_week: '',
    slot: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timetables, siniflar, ogretmenler, dersler] = await Promise.all([
          api.get('/atamalar/timetables'),
          api.get('/siniflar'),
          api.get('/ogretmenler'),
          api.get('/dersler')
        ]);
        
        setEntries(timetables.data);
        setClasses(siniflar.data);
        setTeachers(ogretmenler.data);
        setSubjects(dersler.data);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        toast.error("Veri yüklenirken bir hata oluştu.");
      }
    };
    
    fetchData();
  }, []);

  const ekle = async () => {
    // Form validasyonu
    if (!form.class_id || !form.teacher_id || !form.subject_id || !form.day_of_week || !form.slot) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/atamalar/timetable', form);
      const { data } = await api.get('/atamalar/timetables');
      setEntries(data);
      setForm({ class_id: '', teacher_id: '', subject_id: '', day_of_week: '', slot: '' });
      toast.success("Zamanlama başarıyla eklendi.");
    } catch (error) {
      console.error("Zamanlama eklenirken hata:", error);
      if (error.response?.status === 409) {
        toast.error("Bu zaman diliminde çakışma var!");
      } else {
        toast.error("Zamanlama eklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const dayOptions = [
    { id: "Pazartesi", name: "Pazartesi" },
    { id: "Salı", name: "Salı" },
    { id: "Çarşamba", name: "Çarşamba" },
    { id: "Perşembe", name: "Perşembe" },
    { id: "Cuma", name: "Cuma" }
  ];

  return (
    <div>
      <PageHeader 
        title="Ders Zamanlaması" 
        subtitle="Sınıf, öğretmen ve ders için haftalık zaman çizelgesi oluşturun."
      />

      <Card className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Select
            label="Sınıf"
            id="class_id"
            options={classes}
            value={form.class_id}
            onChange={e => setForm({ ...form, class_id: e.target.value })}
          />
          
          <Select
            label="Ders"
            id="subject_id"
            options={subjects}
            value={form.subject_id}
            onChange={e => setForm({ ...form, subject_id: e.target.value })}
          />
          
          <Select
            label="Öğretmen"
            id="teacher_id"
            options={teachers}
            value={form.teacher_id}
            onChange={e => setForm({ ...form, teacher_id: e.target.value })}
          />
          
          <Select
            label="Gün"
            id="day_of_week"
            options={dayOptions}
            value={form.day_of_week}
            onChange={e => setForm({ ...form, day_of_week: e.target.value })}
          />
          
          <div className="flex flex-col justify-between">
            <Input
              label="Saat Dilimi"
              id="slot"
              placeholder="Örn: 09:00-10:30"
              value={form.slot}
              onChange={e => setForm({ ...form, slot: e.target.value })}
            />
            
            <div className="mt-4">
              <Button
                onClick={ekle}
                isLoading={loading}
                className="w-full" 
              >
                Ekle
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableHeader>Sınıf</TableHeader>
            <TableHeader>Ders</TableHeader>
            <TableHeader>Öğretmen</TableHeader>
            <TableHeader>Gün</TableHeader>
            <TableHeader>Saat Dilimi</TableHeader>
          </TableHead>
          <TableBody>
            {entries.length > 0 ? (
              entries.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.class}</TableCell>
                  <TableCell>{e.subject}</TableCell>
                  <TableCell>{e.teacher}</TableCell>
                  <TableCell>{e.day_of_week}</TableCell>
                  <TableCell>{e.slot}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={5} message="Henüz zamanlama kaydı bulunmuyor." />
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
