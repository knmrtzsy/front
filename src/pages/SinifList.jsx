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

  useEffect(() => {
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
            {siniflar.length > 0 ? (
              siniflar.map(sinif => (
                <TableRow key={sinif.id}>
                  <TableCell className="font-medium">{sinif.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link to={`/siniflar/${sinif.id}/edit`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="inline-flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Düzenle
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        className="inline-flex items-center"
                        onClick={() => handleDelete(sinif.id)}
                        isLoading={deleteLoading === sinif.id}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={2} message="Henüz hiç sınıf eklenmemiş." />
            )}
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
    </div>
  );
}
