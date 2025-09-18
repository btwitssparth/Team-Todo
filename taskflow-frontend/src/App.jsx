import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from './pages/Register';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />

        {/* Redirect any unknown routes to /register */}

        <Route path='/' element={<Navigate to="/register" />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
