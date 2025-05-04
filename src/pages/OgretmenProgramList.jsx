import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Input from "../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";

export default function OgretmenProgramList() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/ogretmenler").then((res) => setTeachers(res.data));
  }, []);
  

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Öğretmenler</h1>
      <Input
        placeholder="Öğretmen ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-md"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Ad / Branş</TableHead>
            <TableHead>Dersler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {filtered.map((t, index) => (
    <TableRow key={t.id} className="hover:bg-gray-100">
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Link
          to={`/program/ogretmen/${t.id}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {t.name}
        </Link>
      </TableCell>
      <TableCell className="text-sm text-gray-500">
        {Array.isArray(t.subjects) ? t.subjects.join(", ") : "-"}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>
    </div>
  );
}