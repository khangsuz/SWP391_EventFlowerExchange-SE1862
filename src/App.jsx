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
import CreateProduct from "./page/seller";
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
import PersonalProduct from "./page/personalProduct";
import ManageProducts from "./page/personalProduct/ManageProducts";
import RegisterSeller from "./page/user/RegisterSeller";
import ChatPage from "./page/chat/chatPage";
import Events from "./page/events";
import SearchResult from "./page/searchResult";
import ManageRevenue from "./page/personalProduct/ManageRevenue";
import ManageOrders from "./page/personalProduct/ManageOrders";
import ChangePassword from "./page/user/ChangePassword";
import OrderHistory from "./page/user/OrderHistory";
import SellerOrderManagement from "./page/personalProduct/SellerOrderManagement";
import AdminReviewManagement from "./page/admin/AdminReviewManagement";
import DamCuoi from "./page/events/DamCuoi";
import KhaiTruong from "./page/events/KhaiTruong";
import KiNiem from "./page/events/KiNiem";
import SinhNhat from "./page/events/SinhNhat";
import ChucMung from "./page/events/ChucMung";

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
      path: "profile",
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
      path: "profile/change-password",
      element: <ChangePassword />,
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
          path: "hoa-khai-truong",
          element: <KhaiTruong />
        },
        {
          path: "hoa-dam-cuoi",
          element: <DamCuoi />
        },
        {
          path: "hoa-ki-niem",
          element: <KiNiem />
        },
        {
          path: "hoa-chuc-mung",
          element: <ChucMung />
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
      path: "/seller/:userId/orders",
      element: <SellerOrderManagement />
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
