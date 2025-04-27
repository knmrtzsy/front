import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function DersList() {
  const navigate = useNavigate();
  const [dersler, setDersler] = useState([]);
  const [yeniIsim, setYeniIsim] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDersId, setSelectedDersId] = useState(null);

  const fetchDersler = async () => {
    try {
      const { data } = await api.get('/dersler');
      setDersler(data);
      setError(null);
    } catch (err) {
      setError('Dersler yüklenirken bir hata oluştu');
      toast.error('Dersler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDersler();
  }, []);

  const ekle = async () => {
    if (!yeniIsim.trim()) {
      toast.error('Lütfen bir ders adı girin');
      return;
    }

    setAddLoading(true);
    try {
      const { data } = await api.post('/dersler', { name: yeniIsim });
      setDersler(prev => [...prev, data]);
      setYeniIsim('');
      toast.success('Ders başarıyla eklendi');
    } catch (err) {
      setError('Ders eklenirken bir hata oluştu');
      toast.error('Ders eklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedDersId(id);
    setIsDeleteModalOpen(true);
  };

  //! burası gibi update yazılacak
  const confirmDelete = async () => {
    if (!selectedDersId) return;
    
    setDeleteLoading(selectedDersId);
    try {
      await api.delete(`/dersler/${selectedDersId}`);
      
      setDersler(prev => prev.filter(d => d.id !== selectedDersId));
      toast.success('Ders başarıyla silindi');
    } catch (err) {
      console.error("Ders silinirken hata:", err);
      toast.error('Ders silinirken hata oluştu.');
    } finally {
      setDeleteLoading(null);
      setSelectedDersId(null);
    }
  };

    const confirmUpdate = async () => {
    if (!selectedDersId) return;
    
    setDeleteLoading(selectedDersId);
    try {

    let json={
      id:'seçtiğin dersin id si olacak',
      name:'inputtan dolacak veri koyulacak',
    }
    
      await api.put(`/dersler/update`,json);
      setDersler(prev => prev.filter(d => d.id !== selectedDersId));
      toast.success('Ders başarıyla silindi');
    } catch (err) {
      console.error("Ders silinirken hata:", err);
      toast.error('Ders silinirken hata oluştu.');
    } finally {
      setDeleteLoading(null);
      setSelectedDersId(null);
    }
  };

  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      ekle();
    }
  };

  if (loading) return <div className="flex justify-center p-8">Yükleniyor...</div>;

  return (
    <div>
      <PageHeader 
        title="Dersler" 
        subtitle="Okuldaki dersleri yönetin"
      />

      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow">
            <Input
              label="Yeni Ders Adı"
              placeholder="Ders adını girin"
              value={yeniIsim}
              onChange={e => setYeniIsim(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button 
              onClick={ekle}
              isLoading={addLoading}
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
            <TableHeader>Ders Adı</TableHeader>
            <TableHeader className="text-right">İşlemler</TableHeader>
          </TableHead>
          <TableBody>
            {dersler.length > 0 ? (
              dersler.map(ders => (
                <TableRow key={ders.id}>
                  <TableCell className="font-medium">{ders.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link to={`/dersler/${ders.id}/edit`}>
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
                        onClick={() => handleDelete(ders.id)}
                        isLoading={deleteLoading === ders.id}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={2} message="Henüz hiç ders eklenmemiş." />
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Dersi Sil"
        message="Bu dersi silmek istediğinizden emin misiniz? Bu işlem dersi tüm öğretmenlerden ve programdan kaldıracaktır."
      />
    </div>
  );
}
