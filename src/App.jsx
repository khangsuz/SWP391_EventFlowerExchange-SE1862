import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./page/home";
import Login from "./page/login";
import SignUp from "./page/signup"
import Dashboard from "./page/admin";
import Cart from "./page/cart";
import Products from "./page/products";
import ProductDetail from "./page/productDetail";
import PrivateRoute from "./component/private-route";
import About from "./page/about";
import Profile from "./page/user/editProfile";
import CreateProduct from "./page/seller/CreateProduct";
import ForgotPassword from './page/login/forgetPassword';
import AdminLayout from "./page/admin/AdminLayout";
import QuanLiSanPham from "./page/admin/QuanLiSanPham";
import QuanLiNguoiDung from "./page/admin/QuanLiNguoiDung";
import QuanLiNguoiBan from "./page/admin/QuanLiNguoiBan";
import QuanLiDonHang from "./page/admin/QuanLiDonHang";
import WithdrawalRequests from "./page/admin/WithdrawalRequests";
import PaymentButton from "./component/button/PaymentButton";
import PaymentResult from "./page/payment/paymentResult";
import CheckoutPage from './page/payment/checkOutPage';
import PersonalProduct from "./page/seller";
import ManageProducts from "./page/seller/ManageProducts";
import RegisterSeller from "./page/user/RegisterSeller";
import ChatPage from "./page/chat/chatPage";
import Events from "./page/events";
import SearchResult from "./page/searchResult";
import ManageRevenue from "./page/seller/ManageRevenue";
import ManageOrders from "./page/seller/ManageOrders";
import ChangePassword from "./page/user/ChangePassword";
import OrderHistory from "./page/user/OrderHistory";
import DamCuoi from "./page/events/DamCuoi";
import VanPhong from "./page/events/VanPhong";
import ThienNhien from "./page/events/ThienNhien";
import SinhNhat from "./page/events/SinhNhat";
import Policy from "./component/policy";
import AdminReviewManagement from "./page/admin/AdminReviewManagement";


const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <SignUp />,
    },
    {
      path: "profile/*",
      element: <Profile />,
      children: [
        {
          path: "register-seller",
          element: <RegisterSeller />,
        },
        {
          path: "order-history",
          element: <OrderHistory />,
        },
        {
          path: "change-password",
          element: <ChangePassword />,
        },
      ],
    },
    {
      path: "cart",
      element: <Cart />,
    },
    {
      path: "about",
      element: <About />,
    },
    {
      path: "product/:id",
      element: <ProductDetail />,
    },
    {
      path: "events",
      element: <Events />,
      children: [
        {
          path: "hoa-sinh-nhat",
          element: <SinhNhat />
        },
        {
          path: "hoa-van-phong",
          element: <VanPhong />
        },
        {
          path: "hoa-dam-cuoi",
          element: <DamCuoi />
        },
        {
          path: "hoa-thien-nhien",
          element: <ThienNhien />
        },
      ],
      element: <Events />,
      children: [
        {
          path: "hoa-sinh-nhat",
          element: <SinhNhat />
        },
        {
          path: "hoa-van-phong",
          element: <VanPhong />
        },
        {
          path: "hoa-dam-cuoi",
          element: <DamCuoi />
        },
        {
          path: "hoa-thien-nhien",
          element: <ThienNhien />
        },
      ],
    },
    {
      path: "/search", 
      element: <SearchResult />, 
    },
    {
      path: "personal-product/:userId", 
      element: <PersonalProduct />, 
    },
    {
      path: "manage-products/:userId",
      element: <ManageProducts />,
    },
    { path: "manage-revenue/:userId", element: <ManageRevenue /> },
    { path: "manage-orders/:userId", element: <ManageOrders /> },
    {
      path: "products",
      element: <Products />,
    },
    {
      path: "/payment-result",
      element: <PaymentResult />
    },
    {
      path: "/checkout",
      element: <CheckoutPage />
    },
    {
      path: "/chat/:conversationId",
      element: <ChatPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "manage-product", 
      element: <PrivateRoute requiredRole="Seller">
        <CreateProduct />
      </PrivateRoute>
    },
    {
      path: "policy",
      element: <Policy />,
    },
    {
      path: "admin",
      element: (
        <PrivateRoute requiredRole="Admin"> 
          <AdminLayout /> 
        </PrivateRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "personal-product/:userId", 
          element: <PersonalProduct />, 
        },
        {
          path: "quanlinguoidung",
          element: <QuanLiNguoiDung />,
        },
        {
          path: "quanlinguoiban",
          element: <QuanLiNguoiBan />,
        },
        {
          path: "quanlisanpham",
          element: <QuanLiSanPham />, 
        },
        {
          path: "quanlidonhang",
          element: <QuanLiDonHang />,
        },
        {
          path: "quanlidanhgia",
          element: <AdminReviewManagement />,
        },
        {
          path: "WithdrawalRequests",
          element: <WithdrawalRequests />,
        },
        {
          path: "quanlidanhgia",
          element: <AdminReviewManagement />,
        },
      ],
    },
    {
      path: "payment",
      element: <PaymentButton />,
    },
    {
      path: "payment-result", 
      element: <PaymentResult />,
    },
  ]);

  return(
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
};

export default App;