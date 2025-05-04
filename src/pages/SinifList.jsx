import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import api from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function SinifList() {
  const navigate = useNavigate();
  const [siniflar, setSiniflar] = useState([]);
  const [yeniIsim, setYeniIsim] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSinifId, setSelectedSinifId] = useState(null);


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSinifId, setEditSinifId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

const fetchData = async () => {
      try {
        const response = await api.get('/siniflar');
        setSiniflar(response.data);
      } catch (err) {
        console.error("Sınıflar yüklenirken hata:", err);
        setError('Sınıflar yüklenirken hata oluştu.');
        toast.error('Sınıflar yüklenirken hata oluştu.');
      }
    };

  useEffect(() => {
    
    
    fetchData();
  }, []);

  const ekle = async () => {
    if (!yeniIsim.trim()) {
      toast.error('Lütfen bir sınıf adı girin.');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/siniflar', { name: yeniIsim });
      setSiniflar(prev => [...prev, data]);
      setYeniIsim('');
      toast.success('Sınıf başarıyla eklendi.');
    } catch (err) {
      console.error("Sınıf eklenirken hata:", err);
      setError('Sınıf eklenirken hata oluştu.');
      toast.error('Sınıf eklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedSinifId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSinifId) return;
    
    setDeleteLoading(selectedSinifId);
    try {
      await api.delete(`/siniflar/${selectedSinifId}`);
      setSiniflar(prev => prev.filter(s => s.id !== selectedSinifId));
      toast.success('Sınıf başarıyla silindi.');
    } catch (err) {
      console.error("Sınıf silinirken hata:", err);
      toast.error('Sınıf silinirken hata oluştu.');
    } finally {
      setDeleteLoading(null);
      setSelectedSinifId(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      ekle();
    }
  };

  const confirmUpdate = async () => {
    if (!editDersId || !editName.trim()) return;
    setEditLoading(true);
    try {
      const payload = { id: editDersId, name: editName.trim() };
      const { data: updated } = await api.put("/dersler/update", payload);
      setDersler(prev => prev.map(d => d.id === updated.id ? updated : d));
      toast.success("Ders başarıyla güncellendi");
      setIsEditModalOpen(false);
      setEditDersId(null);
      setEditName('');
    } catch (err) {
      toast.error("Güncelleme sırasında hata oluştu");
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };
  

  return (
    <div>
      <PageHeader 
        title="Sınıflar" 
        subtitle="Okuldaki sınıfları yönetin"
      />

      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow" style={{color:"#e9c9c9"}}>
            <Input
              label="Yeni Sınıf Adı"
              placeholder="Sınıf adını girin"
              value={yeniIsim}
              onChange={e => setYeniIsim(e.target.value)}
              onKeyPress={handleKeyPress}
              
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button 
              onClick={ekle}
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Ekle
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <Card>
        <Table>
          <TableHead>
            <TableHeader>Sınıf Adı</TableHeader>
            <TableHeader className="text-right">İşlemler</TableHeader>
          </TableHead>
          <TableBody>
            {siniflar.map(sinif => (
              <TableRow key={sinif.id}>
                <TableCell className="font-medium">{sinif.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                  <Button
  variant="secondary"
  size="sm"
  className="inline-flex items-center"
  onClick={() => {
    setEditDersId(ders.id);
    setEditName(ders.name);
    setIsEditModalOpen(true);
  }}
>
  <PencilSquareIcon className="w-4 h-4 mr-1" />
  Düzenle
</Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedSinifId(sinif.id);
                        setIsDeleteModalOpen(true);
                      }}
                      isLoading={deleteLoading === sinif.id}
                    >
                      <TrashIcon className="w-4 h-4 mr-1" /> Sil
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Sınıfı Sil"
        message="Bu sınıfı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Sınıfı Düzenle</h3>
            <Input
              label="Sınıf Adı"
              placeholder="Yeni sınıf adını girin"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
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
