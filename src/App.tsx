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
import SpecialNote from './pages/SpecialNote'
import SetItemCommission from './pages/SetItemCommission'
import ScheduleChanges from './pages/ScheduleChanges'
import ScheduleChannelMenu from './pages/ScheduleChannelMenu'
import PhysicalMenu from './pages/PhysicalMenu'
import InventoryDashboard from './pages/inventory/InventoryDashboard'
import InventoryOldDashboard from './pages/inventory/InventoryOldDashboard'
import StockPurchase, {
  PurchaseOrder,
  PurchaseReturn,
} from './pages/inventory/StockPurchase'
import AddPurchase from './pages/inventory/AddPurchase'
import AddPurchaseOrder from './pages/inventory/AddPurchaseOrder'
import AddPurchaseReturn from './pages/inventory/AddPurchaseReturn'
import AvailableStock from './pages/inventory/AvailableStock'
import ClosingStock from './pages/inventory/ClosingStock'
import Sales from './pages/inventory/Sales'
import AddSales from './pages/inventory/AddSales'
import Transfer from './pages/inventory/Transfer'
import AddTransfer from './pages/inventory/AddTransfer'
import Wastage from './pages/inventory/Wastage'
import AddWastage from './pages/inventory/AddWastage'
import SalesReturn from './pages/inventory/SalesReturn'
import AddSalesReturn from './pages/inventory/AddSalesReturn'
import InventoryPlaceholder from './pages/inventory/InventoryPlaceholder'
import ProductionMaster from './pages/inventory/ProductionMaster'
import AddProduction from './pages/inventory/AddProduction'
import ProductionExecution from './pages/inventory/ProductionExecution'
import BarcodeGeneration from './pages/inventory/BarcodeGeneration'
import BarcodeConfiguration from './pages/inventory/BarcodeConfiguration'
import CurrentStockReport from './pages/inventory/CurrentStockReport'
import StockSummaryReport from './pages/inventory/StockSummaryReport'
import OrderwiseConsumptionReport from './pages/inventory/OrderwiseConsumptionReport'
import OtherReports from './pages/inventory/OtherReports'
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
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/old"
            element={
              <ProtectedRoute>
                <InventoryOldDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase"
            element={
              <ProtectedRoute>
                <StockPurchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase/new"
            element={
              <ProtectedRoute>
                <AddPurchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-order"
            element={
              <ProtectedRoute>
                <PurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-order/new"
            element={
              <ProtectedRoute>
                <AddPurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-return"
            element={
              <ProtectedRoute>
                <PurchaseReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-return/new"
            element={
              <ProtectedRoute>
                <AddPurchaseReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/available-stock"
            element={
              <ProtectedRoute>
                <AvailableStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/closing-stock"
            element={
              <ProtectedRoute>
                <ClosingStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/sales/new"
            element={
              <ProtectedRoute>
                <AddSales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/transfer"
            element={
              <ProtectedRoute>
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/transfer/new"
            element={
              <ProtectedRoute>
                <AddTransfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/wastage"
            element={
              <ProtectedRoute>
                <Wastage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/wastage/new"
            element={
              <ProtectedRoute>
                <AddWastage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/sales-return"
            element={
              <ProtectedRoute>
                <SalesReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/sales-return/new"
            element={
              <ProtectedRoute>
                <AddSalesReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/production-master"
            element={
              <ProtectedRoute>
                <ProductionMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/production-master/new"
            element={
              <ProtectedRoute>
                <AddProduction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/production-execution"
            element={
              <ProtectedRoute>
                <ProductionExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/barcode-generation"
            element={
              <ProtectedRoute>
                <BarcodeGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/barcode-generation/configuration"
            element={
              <ProtectedRoute>
                <BarcodeConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/current-stock"
            element={
              <ProtectedRoute>
                <CurrentStockReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/stock-summary"
            element={
              <ProtectedRoute>
                <StockSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/orderwise-consumption"
            element={
              <ProtectedRoute>
                <OrderwiseConsumptionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports"
            element={
              <ProtectedRoute>
                <OtherReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/raw-materials"
            element={
              <ProtectedRoute>
                <InventoryPlaceholder
                  activeItem="raw-materials"
                  title="Raw Materials"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/item-recipes"
            element={
              <ProtectedRoute>
                <InventoryPlaceholder
                  activeItem="item-recipes"
                  title="Item Recipes"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/suppliers"
            element={
              <ProtectedRoute>
                <InventoryPlaceholder
                  activeItem="suppliers"
                  title="Suppliers"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/units"
            element={
              <ProtectedRoute>
                <InventoryPlaceholder activeItem="units" title="Units" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/categories"
            element={
              <ProtectedRoute>
                <InventoryPlaceholder
                  activeItem="categories"
                  title="Categories"
                />
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
            path="/menu/special-note"
            element={
              <ProtectedRoute>
                <SpecialNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/item-commission"
            element={
              <ProtectedRoute>
                <SetItemCommission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/schedule-changes"
            element={
              <ProtectedRoute>
                <ScheduleChanges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/schedule-changes/:channel"
            element={
              <ProtectedRoute>
                <ScheduleChannelMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/physical-menu"
            element={
              <ProtectedRoute>
                <PhysicalMenu />
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
