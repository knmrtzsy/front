import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../api';

export default function SinifUpdate() {
  const [newName, setNewName] = useState('');
  const selectedSinifId = useParams().id;
  const [deleteLoading, setDeleteLoading] = useState('');
  const confirmUpdate = async () => {

    if (!selectedSinifId) return;
    
    setDeleteLoading(selectedSinifId);
    try {
    let json={
      id:parseInt(selectedSinifId),
      name: newName,
    }
      await api.put(`/siniflar/update`,json);
      toast.success('Sınıf başarıyla güncellendi.');
    } catch (err) {
      console.error("Sınıf güncellenirken hata.:", err);
      toast.error('Sınıf güncellenirken hata oluştu.');
    }
  };

  
  return (
    <div className="flex items-center gap-4">
      {/* Yeni ders adı için textbox */}
      <Input
        label="Sınıfın"
        placeholder="Düzenlemek istediğiniz ismi giriniz."
        value={newName}
        onChange={e => setNewName(e.target.value)}
      />

      {/* Onaylama butonu */}
      <Button
        onClick={confirmUpdate}
        disabled={!newName.trim()}
        isLoading={false /* veya deleteLoading === selectedSinifId */}
      >
        Güncelle
      </Button>
    </div>
  );
  
}
