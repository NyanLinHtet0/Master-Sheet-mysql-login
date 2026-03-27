import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Sheets from "./pages/Sheets";
import View from "./pages/View";
import Login from "./pages/Login";

function App() {
  // auth state
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Hoisted state and initialization
  const [corps, setCorps] = useState([]);

  const fetchCorps = () => {
    fetch("/api/corps", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCorps(data);
        else setCorps([]);
      })
      .catch((err) => console.error("Error fetching corps:", err));
  };

  useEffect(() => {
    fetch("/api/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.auth) {
          setIsAuth(true);
          fetchCorps();
        }
        setAuthChecked(true);
      })
      .catch((err) => {
        console.error("Error checking auth:", err);
        setAuthChecked(true);
      });
  }, []);

  if (!authChecked) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!isAuth) {
    return (
      <Login
        onLoginSuccess={() => {
          setIsAuth(true);
          fetchCorps();
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/Sheets"
            element={<Sheets corps={corps} fetchCorps={fetchCorps} />}
          />
          <Route path="/View" element={<View corps={corps} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;