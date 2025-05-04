import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  DocumentArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import html2pdf from "html2pdf.js";
import api from "../api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function Zamanlama() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(null);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [selEntryId, setSelEntryId] = useState(null);
  const [deletedEntries, setDeletedEntries] = useState([]);
  const tableRef = useRef(null);

  const [form, setForm] = useState({
    subject_id: "",
    teacher_id: "",
    day_of_week: "",
    slotStart: "",
    slotEnd: "",
  });

  useEffect(() => {
    Promise.all([
      api.get("/siniflar"),
      api.get("/ogretmenler"),
      api.get("/dersler"),
      api.get("/atamalar/timetables"),
    ])
      .then(([cls, tch, subj, ent]) => {
        setClasses(cls.data);
        setTeachers(tch.data);
        setSubjects(subj.data);
        setEntries(ent.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Veri yüklenirken hata oluştu");
      });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const cid = parseInt(classId, 10);
  const currentClass = classes.find((c) => c.id === cid);
  if (!currentClass) {
    navigate("/program");
    return null;
  }

  const allEntries = [
    ...entries.filter((e) => e.class_id === cid),
    ...pendingEntries,
  ];
  const organized = allEntries.reduce((acc, e) => {
    acc[e.day_of_week] = acc[e.day_of_week] || {};
    acc[e.day_of_week][e.slot] = e;
    return acc;
  }, {});
  const timeSlots = [...new Set(allEntries.map((e) => e.slot))].sort();
  const dayOptions = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"].map(
    (d) => ({ id: d, name: d })
  );

  
  const ekle = () => {
    const { subject_id, teacher_id, day_of_week, slotStart, slotEnd } = form;
    if (!subject_id || !teacher_id || !day_of_week || !slotStart || !slotEnd) {
      toast.error("Tüm alanları doldurun");
      return;
    }
  
    const newSlot = `${slotStart}-${slotEnd}`;
  
    const parseSlot = (slot) => {
      const [start, end] = slot.split("-").map((s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m;
      });
      return { start, end };
    };
  
    const { start: newStart, end: newEnd } = parseSlot(newSlot);
  
    const sinifCakisiyor = entries.some((e) => {
      if (e.class_id !== cid || e.day_of_week !== day_of_week) return false;
      const { start: s, end: e_ } = parseSlot(e.slot);
      return newStart < e_ && newEnd > s;
    });
  
    if (sinifCakisiyor) {
      toast.error("Bu sınıfın aynı zaman aralığında başka dersi var.");
      return;
    }
  
    const ogretmenCakisiyor = entries.some((e) => {
      if (e.teacher_id !== teacher_id || e.day_of_week !== day_of_week) return false;
      const { start: s, end: e_ } = parseSlot(e.slot);
      return newStart < e_ && newEnd > s;
    });
  
    if (ogretmenCakisiyor) {
      toast.error("Bu öğretmenin aynı zaman aralığında başka dersi var.");
      return;
    }
  
    const newEntry = {
      id: `temp-${Date.now()}`,
      class_id: cid,
      subject_id,
      teacher_id,
      day_of_week,
      slot: newSlot,
    };
  
    setEntries((prev) => [...prev, newEntry]);
    setPendingEntries((prev) => [...prev, newEntry]);
    setForm({ subject_id: "", teacher_id: "", day_of_week: "", slotStart: "", slotEnd: "" });
    setIsDirty(true);
  };
  

  const handleDelete = (id) => {
    setSelEntryId(id);
    setIsDelModalOpen(true);
  };

  const confirmDelete = () => {
    if (selEntryId?.toString().startsWith("temp-")) {
      setPendingEntries((prev) => prev.filter((e) => e.id !== selEntryId));
    } else {
      const silinen = entries.find((e) => e.id === selEntryId);
      setEntries((prev) => prev.filter((e) => e.id !== selEntryId));
      setDeletedEntries((prev) => [...prev, silinen]);
    }
    setIsDirty(true);
    setIsDelModalOpen(false);
  };

  const handleSave = async () => {
    try {
      for (const entry of pendingEntries) {
        await api.post("/atamalar/timetable", {
          class_id: entry.class_id,
          subject_id: entry.subject_id,
          teacher_id: entry.teacher_id,
          day_of_week: entry.day_of_week,
          slot: entry.slot,
        });
      }
      for (const entry of deletedEntries) {
        await api.delete(`/atamalar/timetable/${entry.id}`);
      }
      const { data } = await api.get("/atamalar/timetables");
      setEntries(data);
      setPendingEntries([]);
      setDeletedEntries([]);
      setIsDirty(false);
      toast.success("Değişiklikler kaydedildi");
    } catch (err) {
      console.error(err);
      toast.error("Kaydederken hata");
    }
  };

  const handleReset = () => {
    if (window.confirm("Sınıfın içeriğini sıfırlamak istiyor musunuz?")) {
      const silinecekler = entries.filter((e) => e.class_id === cid);
      setPendingEntries([]);
      setDeletedEntries((prev) => [...prev, ...silinecekler]);
      setEntries((prev) => prev.filter((e) => e.class_id !== cid));
      setIsDirty(true);
    }
  };
  
  

  const exportToPdf = () => {
    html2pdf()
      .set({
        margin: 1,
        filename: `${currentClass.name}-program.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      })
      .from(tableRef.current)
      .save();
  };

  const handleBack = () => {
    if (
      isDirty &&
      !window.confirm(
        "Değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?"
      )
    )
      return;
    navigate("/program");
  };

  return (
    <div>
      <PageHeader
        title={`Zamanlama: ${currentClass.name}`}
        subtitle="Ders, öğretmen, gün ve saat seçin"
        actions={
          <div className="flex gap-2">
            <Button onClick={exportToPdf} variant="secondary">
              <DocumentArrowDownIcon className="w-5 h-5 mr-1" /> PDF
            </Button>
            <Button onClick={handleSave} variant="primary">
              Kaydet
            </Button>
          </div>
        }
      />
      <div className="mt-4">
        <Button variant="secondary" onClick={handleBack}>
          Sınıf Seçimine Dön
        </Button>
      </div>
      <Card className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
          <Select
            label="Ders"
            id="subject_id"
            options={subjects}
            value={form.subject_id}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                subject_id: e.target.value,
                teacher_id: "",
              }))
            }
          />
          <Select
            label="Öğretmen"
            id="teacher_id"
            disabled={!form.subject_id}
            options={teachers.filter((t) =>
              t.subject_ids.includes(+form.subject_id)
            )}
            value={form.teacher_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, teacher_id: e.target.value }))
            }
          />
          <Select
            label="Gün"
            id="day_of_week"
            options={dayOptions}
            value={form.day_of_week}
            onChange={(e) =>
              setForm((p) => ({ ...p, day_of_week: e.target.value }))
            }
          />
          <Input
  type="time"
  label="Başlangıç"
  value={form.slotStart}
  onChange={(e) => {
    const newStart = e.target.value;
    setForm((prev) => ({
      ...prev,
      slotStart: newStart,
      slotEnd:
        prev.slotEnd && prev.slotEnd <= newStart ? "" : prev.slotEnd,
    }));
  }}
/>

<Input
  type="time"
  label="Bitiş"
  min={form.slotStart || undefined}
  value={form.slotEnd}
  onChange={(e) => {
    const newEnd = e.target.value;
    if (form.slotStart && newEnd <= form.slotStart) {
      toast.error("Ders bitiş saati başlangıçtan büyük olmalı.");
      return;
    }
    setForm((prev) => ({ ...prev, slotEnd: newEnd }));
  }}
/>
          <div className="lg:col-span-1">
            <Button onClick={ekle} isLoading={loading} className="w-full">
              <PlusIcon className="w-5 h-5 mr-1" /> Ekle
            </Button>
          </div>
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50">Saat</th>
                {dayOptions.map((d) => (
                  <th key={d.id} className="px-6 py-3 bg-gray-50">
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {slot}
                  </td>
                  {dayOptions.map((d) => {
                    const e = organized[d.id]?.[slot];
                    return (
                      <td
                        key={d.id}
                        className="px-6 py-4 text-sm text-gray-500"
                      >
                        {e ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {currentClass.name}
                              </span>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(e.id)}
                                isLoading={delLoading === e.id}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-blue-600 font-medium">
                              {e.subject}
                            </div>
                            <div className="text-gray-600">{e.teacher}</div>
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
      <div className="flex justify-end mt-4">
        <Button onClick={handleReset} variant="destructive">
          Sıfırla
        </Button>
      </div>
      <ConfirmModal
        isOpen={isDelModalOpen}
        onClose={() => setIsDelModalOpen(false)}
        onConfirm={confirmDelete}
        title="Kayıt Sil"
        message="Bu kaydı silmek istediğinize emin misiniz?"
      />
    </div>
  );
}
