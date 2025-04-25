import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function OgretmenEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      // Only fetch teacher data if editing an existing teacher
      if (id) {
        const [{ data: allSubjects }, { data: teacherData }] =
          await Promise.all([
            api.get("/dersler"),
            api.get(`/ogretmenler/${id}`),
          ]);
        
        setAvailableSubjects(allSubjects);
        setName(teacherData.name);
        setSubjects(teacherData.subject_ids || []);
      } else {
        // For new teacher, just fetch available subjects
        const { data: allSubjects } = await api.get("/dersler");
        setAvailableSubjects(allSubjects);
      }
    } catch (error) {
      console.error("Veri alınırken hata:", error);
      toast.error("Veriler yüklenirken hata oluştu.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Lütfen öğretmen adı girin.");
      return;
    }
    
    setLoading(true);
    
    try {
      if (id) {
        // Update existing teacher
        await api.put(`/ogretmenler/${id}`, { name, subjects });
        toast.success("Öğretmen başarıyla güncellendi.");
      } else {
        // Create new teacher
        await api.post("/ogretmenler", { name, subjects });
        toast.success("Öğretmen başarıyla eklendi.");
      }
      navigate("/ogretmenler");
    } catch (error) {
      console.error("Öğretmen kaydedilirken hata:", error);
      toast.error("Öğretmen kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      setSubjects([...subjects, selectedSubject]);
      setSelectedSubject("");
      toast.success("Ders başarıyla eklendi.");
    }
  };

  const removeSubject = (subjectId) => {
    setSubjects(subjects.filter((id) => id !== subjectId));
    toast.success("Ders başarıyla kaldırıldı.");
  };

  return (
    <div>
      <PageHeader 
        title={id ? "Öğretmen Düzenle" : "Yeni Öğretmen Ekle"} 
        subtitle={id ? "Öğretmen bilgilerini güncelle" : "Yeni öğretmen bilgilerini gir"}
      />

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="mb-4">
            <Input
              label="Öğretmen Adı Soyadı"
              placeholder="Öğretmen adını girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="text-lg font-medium mb-4">Dersler</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end mb-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-[#E9C9C9] mb-1">
                Ders Seçin
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Ders seçin</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                type="button"
                onClick={addSubject}
                disabled={!selectedSubject}
                className="w-full sm:w-auto"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Ekle
              </Button>
            </div>
          </div>

          {subjects.length > 0 ? (
            <div className="space-y-2 mt-4">
              {subjects.map((subjectId) => {
                const subject = availableSubjects.find((s) => s.id === subjectId);
                return subject ? (
                  <div 
                    key={subjectId} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <span className="font-medium">{subject.name}</span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeSubject(subjectId)}
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Kaldır
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
              Henüz ders seçilmedi
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={loading}
          >
            {id ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
