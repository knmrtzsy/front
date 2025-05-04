import React, { useState, useEffect } from "react";
import { useNavigate, Link} from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";

export default function ProgramSinifList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/siniflar")
      .then(({ data }) => setClasses(data))
      .catch(err => {
        console.error(err);
        toast.error("Sınıflar yüklenirken hata oluştu");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Yükleniyor…</div>;

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Program – Sınıf Seçimi"
        subtitle="Zamanlama için önce bir sınıf seçin"
      />

      <div className="mb-6 max-w-sm">
        <Input
          label="Sınıf Ara"
          placeholder="Sınıf adı girin"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length > 0 ? (
          filtered.map(c => (
            <Link to={`/program/${c.id}`} key={c.id}>
  <Card className="text-center py-6 hover:shadow-lg cursor-pointer">
    <h3 className="text-xl font-semibold">{c.name}</h3>
  </Card>
</Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Eşleşen sınıf bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
