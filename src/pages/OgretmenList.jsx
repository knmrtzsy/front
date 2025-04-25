import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../api';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function OgretmenList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOgretmenId, setSelectedOgretmenId] = useState(null);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/ogretmenler');
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError('Öğretmenler yüklenirken bir hata oluştu');
      toast.error('Öğretmenler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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
      toast.success('Öğretmen başarıyla silindi');
    } catch (err) {
      setError('Öğretmen silinirken bir hata oluştu');
      toast.error('Öğretmen silinirken bir hata oluştu');
      console.error(err);
    } finally {
      setDeleteLoading(null);
      setSelectedOgretmenId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Yükleniyor...</div>;

  return (
    <div>
      <PageHeader 
        title="Öğretmenler" 
        subtitle="Öğretmen listesi ve ders atamaları"
        actions={
          <Button onClick={() => navigate('/ogretmenler/yeni')}>
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
              teachers.map(teacher => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Henüz ders atanmamış</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link to={`/ogretmenler/${teacher.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="inline-flex items-center"
                        >
                          <PencilSquareIcon className="w-4 h-4 mr-1" />
                          Düzenle
                        </Button>
                      </Link>
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
              <EmptyState colSpan={3} message="Henüz hiç öğretmen eklenmemiş." />
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
    </div>
  );
}
