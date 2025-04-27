import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import NavBar from "./components/NavBar";
import SinifList from "./pages/SinifList";
import SinifEdit from "./pages/SinifEdit";
import OgretmenList from "./pages/OgretmenList";
import OgretmenEdit from "./pages/OgretmenEdit";
import DersList from "./pages/DersList";
import DersEdit from "./pages/DersEdit";
import Zamanlama from "./pages/Zamanlama";

function Footer() {
  return (
    <footer
      className="bg-gray-100 border-t border-gray-200 py-4 mt-10"
      style={{
        backgroundColor: "#f3f4f6",
        borderTopWidth: "1px",
        borderColor: "#e5e7eb",
        paddingTop: "1rem",
        paddingBottom: "1rem",
        marginTop: "2.5rem",
      }}
    >
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: "80rem", paddingLeft: "1rem", paddingRight: "1rem" }}
      >
        <p
          className="text-center text-sm text-gray-500"
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          &copy; {new Date().getFullYear()} Ders Programı Uygulaması
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #001B17, #00313B, #005F6B)",
      }}
    >
      <NavBar />
      <main
        className="flex-grow mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        style={{ flexGrow: 1, maxWidth: "80rem", padding: "2rem 1rem" }}
      >
        <Routes>
          {/* Anasayfaya yönlendirme, burada '/siniflar' adresine yönlendiriyor */}
          <Route path="/" element={<Navigate to="/siniflar" />} />

          {/* Sayfa yönlendirmeleri */}
          <Route path="/siniflar" element={<SinifList />} />
          <Route path="/siniflar/:id/edit" element={<SinifEdit />} />
		      <Route path="/dersler" element={<DersList />} />
          <Route path="/dersler/:id/edit" element={<DersEdit />} />
          <Route path="/ogretmenler" element={<OgretmenList />} />
          <Route path="/ogretmenler/yeni" element={<OgretmenEdit />} />
          <Route path="/ogretmenler/:id" element={<OgretmenEdit />} />
          
          <Route path="/zamanlama" element={<Zamanlama />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
