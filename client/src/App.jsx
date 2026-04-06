import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProduct from "./pages/CreateProduct";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";
import MyOrders from "./pages/MyOrders";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
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
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller-dashboard" 
          element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/seller/:id" element={<SellerProfile />} />
      </Routes>
    </>
  );
}

export default App;