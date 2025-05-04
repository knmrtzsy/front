import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function ProgramYonu() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Program Seçimi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button
          className="p-6 text-xl"
          onClick={() => navigate("/program/sinif-secimi")}
        >
          🏫 Ders Programı - Sınıf Seçimi
        </Button>
        <Button
          className="p-6 text-xl"
          onClick={() => navigate("/program/ogretmen-secimi")}
        >
          👨‍🏫 Öğretmen Ders Programı
        </Button>
      </div>
    </div>
  );
}