import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function DersUpdate() {
  const [newName, setNewName] = useState('');
  const selectedDersId = useParams().id;
  const [deleteLoading, setDeleteLoading] = useState('');
  const navigate = useNavigate();
  const confirmUpdate = async () => {

    if (!selectedDersId) return;
    
    setDeleteLoading(selectedDersId);
    try {
    let json={
      id:parseInt(selectedDersId),
      name: newName,
    }
      await api.put(`/dersler/update`,json);
      toast.success('Ders başarıyla güncellendi.');
      navigate('/dersler');
    } catch (err) {
      console.error("Ders güncellenirken hata.:", err);
      toast.error('Ders güncellenirken hata oluştu.');
    }
  };

  
  return (
    <div className="flex items-center gap-4">
      {/* Yeni ders adı için textbox */}
      <Input
        label="Yeni Ders Adı"
        placeholder="Dersin yeni adını girin"
        value={newName}
        onChange={e => setNewName(e.target.value)}
      />

      {/* Onaylama butonu */}
      <Button
        onClick={confirmUpdate}
        disabled={!newName.trim()}
        isLoading={false /* veya deleteLoading === selectedDersId */}
      >
        Güncelle
      </Button>
    </div>
  );
  
}
/*  const confirmUpdate = async () => {
    if (!selectedDersId) return;
    
    setDeleteLoading(selectedDersId);
    try {

    let json={
      id:'seçtiğin dersin id si olacak',
      name:'inputtan dolacak veri koyulacak',
    }
    
      await api.put(`/dersler/update`,json);
      setDersler(prev => prev.filter(d => d.id !== selectedDersId));
      toast.success('Ders başarıyla güncellendi.');
    } catch (err) {
      console.error("Ders güncellenirken hata.:", err);
      toast.error('Ders güncellenirken hata oluştu.');
    } finally {
      setDeleteLoading(null);
      setSelectedDersId(null);
    }
  };
 */