import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './auth/AuthContext'
import AllOrders from './pages/AllOrders'
import Dashboard from './pages/Dashboard'
import Kot from './pages/Kot'
import LiveOrders from './pages/LiveOrders'
import Login from './pages/Login'
import AddArea from './pages/AddArea'
import AddAddonGroup from './pages/AddAddonGroup'
import AddCategory from './pages/AddCategory'
import AddDiscount from './pages/AddDiscount'
import AddonsManagement from './pages/AddonsManagement'
import AddTable from './pages/AddTable'
import AddTax from './pages/AddTax'
import AllInOneMenu from './pages/AllInOneMenu'
import BackwardTaxPrintingSettings from './pages/BackwardTaxPrintingSettings'
import BaseMenu from './pages/BaseMenu'
import Billing from './pages/billing/Billing'
import CategoryManagement from './pages/CategoryManagement'
import DineInMenu from './pages/DineInMenu'
import DiscountsManagement from './pages/DiscountsManagement'
import EditAddonGroup from './pages/EditAddonGroup'
import EditCategory from './pages/EditCategory'
import EditMenuItem from './pages/EditMenuItem'
import EditParentCategory from './pages/EditParentCategory'
import EditTax from './pages/EditTax'
import HomeDeliveryMenu from './pages/HomeDeliveryMenu'
import ItemOrderWiseTaxSettings from './pages/ItemOrderWiseTaxSettings'
import MenuManagement from './pages/MenuManagement'
import MultiItemImagesUpload from './pages/MultiItemImagesUpload'
import OnlineOrders from './pages/OnlineOrders'
import ParcelMenu from './pages/ParcelMenu'
import SwiggyMenu from './pages/SwiggyMenu'
import ZomatoMenu from './pages/ZomatoMenu'
import TablesAreasManagement from './pages/TablesAreasManagement'
import TaxesManagement from './pages/TaxesManagement'
import VariantsManagement from './pages/VariantsManagement'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-orders"
            element={
              <ProtectedRoute>
                <LiveOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-orders"
            element={
              <ProtectedRoute>
                <AllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/online-orders"
            element={
              <ProtectedRoute>
                <OnlineOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kot"
            element={
              <ProtectedRoute>
                <Kot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/multi-item-images"
            element={
              <ProtectedRoute>
                <MultiItemImagesUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/all-in-one"
            element={
              <ProtectedRoute>
                <AllInOneMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/base-menu"
            element={
              <ProtectedRoute>
                <BaseMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/channel/:channel/:id/edit"
            element={
              <ProtectedRoute>
                <EditMenuItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/home-delivery"
            element={
              <ProtectedRoute>
                <HomeDeliveryMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/parcel"
            element={
              <ProtectedRoute>
                <ParcelMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/dine-in"
            element={
              <ProtectedRoute>
                <DineInMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/zomato"
            element={
              <ProtectedRoute>
                <ZomatoMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/swiggy"
            element={
              <ProtectedRoute>
                <SwiggyMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/categories"
            element={
              <ProtectedRoute>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/categories/new"
            element={
              <ProtectedRoute>
                <AddCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/categories/parent/:id/edit"
            element={
              <ProtectedRoute>
                <EditParentCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/categories/:id/edit"
            element={
              <ProtectedRoute>
                <EditCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/variants"
            element={
              <ProtectedRoute>
                <VariantsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/addons"
            element={
              <ProtectedRoute>
                <AddonsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/addons/new"
            element={
              <ProtectedRoute>
                <AddAddonGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/addons/:id/edit"
            element={
              <ProtectedRoute>
                <EditAddonGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/tables"
            element={
              <ProtectedRoute>
                <TablesAreasManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/tables/new"
            element={
              <ProtectedRoute>
                <AddTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/tables/areas/new"
            element={
              <ProtectedRoute>
                <AddArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/taxes"
            element={
              <ProtectedRoute>
                <TaxesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/taxes/new"
            element={
              <ProtectedRoute>
                <AddTax />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/taxes/backward-printing"
            element={
              <ProtectedRoute>
                <BackwardTaxPrintingSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/taxes/item-order-wise"
            element={
              <ProtectedRoute>
                <ItemOrderWiseTaxSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/taxes/:id/edit"
            element={
              <ProtectedRoute>
                <EditTax />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/discounts"
            element={
              <ProtectedRoute>
                <DiscountsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/discounts/new"
            element={
              <ProtectedRoute>
                <AddDiscount />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
