import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import html2pdf from "html2pdf.js";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function OgretmenDersProgrami() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef();
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacher, setTeacher] = useState(null);

  const dayOptions = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  useEffect(() => {
    Promise.all([
      api.get(`/ogretmenler/${id}`),
      api.get("/atamalar/timetables"),
      api.get("/dersler"),
      api.get("/siniflar"),
    ]).then(([ogretmenRes, timeRes, subjRes, classRes]) => {
      setTeacher(ogretmenRes.data);
      setTimetable(timeRes.data.filter((t) => t.teacher_id == id));
      setSubjects(subjRes.data);
      setClasses(classRes.data);
    });
  }, [id]);

  const getName = (list, id) => list.find((x) => x.id === id)?.name || "";

  const organized = timetable.reduce((acc, e) => {
    acc[e.day_of_week] = acc[e.day_of_week] || {};
    acc[e.day_of_week][e.slot] = e;
    return acc;
  }, {});

  const timeSlots = [...new Set(timetable.map((e) => e.slot))].sort();

  const exportToPdf = () => {
    html2pdf()
      .set({
        margin: 1,
        filename: `${teacher?.name || id}-program.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      })
      .from(tableRef.current)
      .save();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Link to="/program/ogretmen-secimi">
          <Button variant="outline">Listeye Dön</Button>
        </Link>{" "}
        <Button variant="secondary" onClick={exportToPdf}>
          PDF
        </Button>
      </div>
      <h1 className="text-xl font-bold mb-4">
        {teacher ? `${teacher.name} (${teacher.subjects})` : "Yükleniyor..."}
      </h1>
      <Card>
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50">Saat</th>
                {dayOptions.map((d) => (
                  <th key={d} className="px-6 py-3 bg-gray-50">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {slot}
                  </td>
                  {dayOptions.map((d) => {
                    const e = organized[d]?.[slot];
                    return (
                      <td key={d} className="px-6 py-4 text-sm text-gray-500">
                        {e ? (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-800">
                              {getName(classes, e.class_id)}
                            </div>
                            <div className="text-blue-600 font-medium">
                              {getName(subjects, e.subject_id)}
                            </div>
                          </div>
                        ) : (
                          "---"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
