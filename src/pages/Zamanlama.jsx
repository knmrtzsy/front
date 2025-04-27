import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {PlusIcon,DocumentArrowDownIcon,TrashIcon} from "@heroicons/react/24/outline";
import html2pdf from "html2pdf.js";
import api from "../api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function Zamanlama() {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const tableRef = useRef(null);
  const [form, setForm] = useState({
    class_id: "",
    teacher_id: "",
    subject_id: "",
    day_of_week: "",
    slotStart: "",
    slotEnd: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, teachersRes, subjectsRes, entriesRes] =
          await Promise.all([
            api.get("/siniflar"),
            api.get("/ogretmenler"),
            api.get("/dersler"),
            api.get("/atamalar/timetables"),
          ]);
        setClasses(classesRes.data);
        setTeachers(teachersRes.data);
        setSubjects(subjectsRes.data);
        setEntries(entriesRes.data);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        toast.error("Veri yüklenirken hata oluştu");
      }
    };
    fetchData();
  }, []);

  const ekle = async () => {
    const {
      class_id,
      teacher_id,
      subject_id,
      day_of_week,
      slotStart,
      slotEnd,
    } = form;
    if (
      !class_id ||
      !teacher_id ||
      !subject_id ||
      !day_of_week ||
      !slotStart ||
      !slotEnd
    ) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    const [sh, sm] = slotStart.split(":").map(Number);
    const [eh, em] = slotEnd.split(":").map(Number);
    const start = new Date();
    start.setHours(sh);
    start.setMinutes(sm);
    const end = new Date();
    end.setHours(eh);
    end.setMinutes(em);
    if (end - start < 60000) {
      toast.error("Ders bitiş, başlangıçtan küçük olamaz.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/atamalar/timetable", {
        class_id,
        teacher_id,
        subject_id,
        day_of_week,
        slot: `${slotStart}-${slotEnd}`,
      });
      const { data } = await api.get("/atamalar/timetables");
      setEntries(data);
      setForm({
        class_id: "",
        teacher_id: "",
        subject_id: "",
        day_of_week: "",
        slotStart: "",
        slotEnd: "",
      });
      toast.success("Zamanlama başarıyla eklendi.");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 409)
        toast.error("Bu zaman diliminde çakışma var!");
      else toast.error("Zamanlama eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedEntryId(id);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedEntryId) return;
    setDeleteLoading(selectedEntryId);
    try {
      await api.delete(`/atamalar/timetable/${selectedEntryId}`);
      setEntries((prev) => prev.filter((e) => e.id !== selectedEntryId));
      toast.success("Ders programdan kaldırıldı.");
    } catch (error) {
      console.error(error);
      toast.error("Silme işlemi sırasında bir hata oluştu.");
    } finally {
      setDeleteLoading(null);
      setSelectedEntryId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const exportToPdf = () => {
    const element = tableRef.current;
    const opt = {
      margin: 1,
      filename: "ders-programi.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
    };
    toast.promise(html2pdf().set(opt).from(element).save(), {
      loading: "PDF hazırlanıyor...",
      success: "PDF başarıyla indirildi",
      error: "PDF oluşturulurken hata oluştu",
    });
  };

  const dayOptions = [
    { id: "Pazartesi", name: "Pazartesi" },
    { id: "Salı", name: "Salı" },
    { id: "Çarşamba", name: "Çarşamba" },
    { id: "Perşembe", name: "Perşembe" },
    { id: "Cuma", name: "Cuma" },
  ];
  const organizedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) acc[entry.day_of_week] = {};
    acc[entry.day_of_week][entry.slot] = entry;
    return acc;
  }, {});
  const timeSlots = [...new Set(entries.map((e) => e.slot))].sort();

  return (
    <div>
      <PageHeader
        title="Ders Zamanlaması"
        subtitle="Sınıf, öğretmen ve ders için haftalık zaman çizelgesi oluşturun."
        actions={
          <Button onClick={exportToPdf} variant="secondary">
            <DocumentArrowDownIcon className="w-5 h-5 mr-1" />
            PDF İndir
          </Button>
        }
      />
      <Card className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
          <Select
            label="Sınıf"
            id="class_id"
            options={classes}
            value={form.class_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, class_id: e.target.value }))
            }
          />
          <Select
            label="Ders"
            id="subject_id"
            options={subjects}
            value={form.subject_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, subject_id: e.target.value }))
            }
          />
          <Select
            label="Öğretmen"
            id="teacher_id"
            options={teachers}
            value={form.teacher_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, teacher_id: e.target.value }))
            }
          />
          <Select
            label="Gün"
            id="day_of_week"
            options={dayOptions}
            value={form.day_of_week}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, day_of_week: e.target.value }))
            }
          />
          <div className="flex items-end space-x-2">
            <Input
              type="time"
              label="Ders Başlangıç"
              id="slotStart"
              placeholder="Örn: 09:00"
              value={form.slotStart}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  slotStart: e.target.value,
                  slotEnd: "",
                }))
              }
            />
            <span className="select-none">–</span>
            <Input
              type="time"
              label="Ders Bitiş"
              id="slotEnd"
              placeholder="Örn: 10:30"
              value={form.slotEnd}
              min={(() => {
                if (!form.slotStart) return "";
                const [h, m] = form.slotStart.split(":").map(Number);
                const date = new Date();
                date.setHours(h);
                date.setMinutes(m + 1);
                const hh = String(date.getHours()).padStart(2, "0");
                const mm = String(date.getMinutes()).padStart(2, "0");
                return `${hh}:${mm}`;
              })()}
              onChange={(e) => {
                const value = e.target.value;
                if (form.slotStart) {
                  const [sh, sm] = form.slotStart.split(":").map(Number);
                  const [eh, em] = value.split(":").map(Number);
                  const start = new Date();
                  start.setHours(sh);
                  start.setMinutes(sm);
                  const end = new Date();
                  end.setHours(eh);
                  end.setMinutes(em);
                  if (end - start < 60000) {
                    toast.error(
                      "Ders bitiş, başlangıçtan en az bir dakika sonra olmalı."
                    );
                    return;
                  }
                }
                setForm((prev) => ({ ...prev, slotEnd: value }));
              }}
            />
            <Button
              onClick={ekle}
              isLoading={loading}
              disabled={!form.slotStart || !form.slotEnd}
              className="ml-4"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Ekle
            </Button>
          </div>
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saat
                </th>
                {dayOptions.map((day) => (
                  <th
                    key={day.id}
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slot}
                  </td>
                  {dayOptions.map((day) => {
                    const entry = organizedEntries[day.id]?.[slot];
                    return (
                      <td
                        key={day.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {entry ? (
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-900">
                                {entry.class}
                              </div>
                              <Button
                                variant="danger"
                                size="sm"
                                className="ml-2 -mt-1"
                                onClick={() => handleDelete(entry.id)}
                                isLoading={deleteLoading === entry.id}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-blue-600 font-medium">
                              {entry.subject}
                            </div>
                            <div className="text-gray-600">{entry.teacher}</div>
                          </div>
                        ) : (
                          "---"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Dersi Kaldır"
        message="Bu dersi programdan kaldırmak istediğinizden emin misiniz?"
      />
    </div>
  );
}
