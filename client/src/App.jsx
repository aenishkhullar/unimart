import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProduct from "./pages/CreateProduct";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/create-product" 
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          } 
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route 
          path="/edit-product/:id" 
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;