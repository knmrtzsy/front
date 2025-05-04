import React, { Component, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import api from "../api";
import Button from "../components/ui/Button"
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
} from "../components/ui/Table";
import ConfirmModal from "../components/ui/ConfirmModal";
import Input from "../components/ui/Input";

export default function OgretmenList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOgretmenId, setSelectedOgretmenId] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOgretmenId, setEditOgretmenId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSubjects, setEditSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get("/ogretmenler");
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError("Öğretmenler yüklenirken bir hata oluştu");
      toast.error("Öğretmenler yüklenirken bir hata oluştu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get("/dersler");
      setAvailableSubjects(data);
    } catch (err) {
      console.error("Dersler yüklenirken hata:", err);
      toast.error("Dersler yüklenirken hata oluştu");
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const handleDelete = (id) => {
    setSelectedOgretmenId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOgretmenId) return;

    setDeleteLoading(selectedOgretmenId);
    try {
      await api.delete(`/ogretmenler/${selectedOgretmenId}`);
      fetchTeachers();
      toast.success("Öğretmen başarıyla silindi");
    } catch (err) {
      setError("Öğretmen silinirken bir hata oluştu");
      toast.error("Öğretmen silinirken bir hata oluştu");
      console.error(err);
    } finally {
      setDeleteLoading(null);
      setSelectedOgretmenId(null);
    }
  };

  const addSubject = () => {
    if (selectedSubject && !editSubjects.includes(selectedSubject)) {
      setEditSubjects([...editSubjects, selectedSubject]);
      setSelectedSubject("");
    }
  };

  const removeSubject = (subjectId) => {
    setEditSubjects(editSubjects.filter((id) => id !== subjectId));
  };

  const confirmUpdate = async () => {
    if (!editOgretmenId) return;
    setEditLoading(true);
    try {
      const { data: updated } = await api.put("/ogretmenler/update", {
        id: editOgretmenId,
        name: editName.trim(),
        subjects: editSubjects,
      });
      setTeachers((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      toast.success("Öğretmen başarıyla güncellendi");
      setIsEditModalOpen(false);
      setEditOgretmenId(null);
      setEditName("");
      setEditSubjects([]);
      await fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Öğretmen güncellenirken hata oluştu");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading)
    return <div className="flex justify-center p-8">Yükleniyor...</div>;

  return (
    <div>
      <PageHeader
        title="Öğretmenler"
        subtitle="Öğretmen listesi ve ders atamaları"
        actions={
          <Button onClick={() => navigate("/ogretmenler/yeni")}>
            <PlusIcon className="w-5 h-5 mr-1" />
            Yeni Öğretmen Ekle
          </Button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <Card>
        <Table>
          <TableHead>
            <TableHeader>Ad Soyad</TableHeader>
            <TableHeader>Dersler</TableHeader>
            <TableHeader className="text-right">İşlemler</TableHeader>
          </TableHead>
          <TableBody>
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Henüz ders atanmamış
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="inline-flex items-center"
                        onClick={() => {
                          setEditOgretmenId(teacher.id);
                          setEditName(teacher.name);
                          setEditSubjects(teacher.subject_ids || []);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-1" />
                        Düzenle
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        className="inline-flex items-center"
                        onClick={() => handleDelete(teacher.id)}
                        isLoading={deleteLoading === teacher.id}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState
                colSpan={3}
                message="Henüz hiç öğretmen eklenmemiş."
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Öğretmeni Sil"
        message="Bu öğretmeni silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Öğretmen Düzenle</h3>
            <div className="space-y-4">
              <Input
                label="Öğretmen Adı"
                placeholder="Yeni öğretmen adını girin"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dersler
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  <Button
                    type="button"
                    onClick={addSubject}
                    disabled={!selectedSubject}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {editSubjects.map((subjectId) => {
                    const subject = availableSubjects.find(
                      (s) => s.id === subjectId
                    );
                    return subject ? (
                      <div
                        key={subjectId}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-md border border-gray-200"
                      >
                        <span className="font-medium">{subject.name}</span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeSubject(subjectId)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                İptal
              </Button>
              <Button onClick={confirmUpdate} isLoading={editLoading}>
                Güncelle
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
