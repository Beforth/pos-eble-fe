import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './auth/AuthContext'
import AllOrders from './pages/AllOrders'
import Dashboard from './pages/Dashboard'
import Kot from './pages/Kot'
import LiveOrders from './pages/LiveOrders'
import Login from './pages/Login'
import ScreenDisplay from './pages/screens/ScreenDisplay'
import ScreenManager from './pages/screens/ScreenManager'
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
import CaptainOrders from './pages/captainorders/CaptainOrders'
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
import PlaceholderPage from './pages/PlaceholderPage'
import Configuration from './pages/Configuration'
import CurrentOrders from './pages/configuration/CurrentOrders'
import CoverSizeReport from './pages/reports/CoverSizeReport'
import TableView from './pages/TableView'
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
import ConsumptionSummaryReport from './pages/inventory/ConsumptionSummaryReport'
import OpeningClosingStockReport from './pages/inventory/OpeningClosingStockReport'
import FoodCostingReport from './pages/inventory/FoodCostingReport'
import RecipeCostingReport from './pages/inventory/RecipeCostingReport'
import MaterialPurchaseReport from './pages/inventory/MaterialPurchaseReport'
import SupplierPaymentReport from './pages/inventory/SupplierPaymentReport'
import MaterialTransferReport from './pages/inventory/MaterialTransferReport'
import TransferPaymentReport from './pages/inventory/TransferPaymentReport'
import PurchaseSalesReturnReport from './pages/inventory/PurchaseSalesReturnReport'
import ManualStockEntryReport from './pages/inventory/ManualStockEntryReport'
import StockReportTimewise from './pages/inventory/StockReportTimewise'
import SalesTransferVarianceReport from './pages/inventory/SalesTransferVarianceReport'
import RaisedPoVarianceReport from './pages/inventory/RaisedPoVarianceReport'
import PurchaseOrderReceivedReport from './pages/inventory/PurchaseOrderReceivedReport'
import SemiFinishedFoodCostingReport from './pages/inventory/SemiFinishedFoodCostingReport'
import PaymentLedgerReport from './pages/inventory/PaymentLedgerReport'
import ExpiryBatchwiseInsightReport from './pages/inventory/ExpiryBatchwiseInsightReport'
import RawMaterials from './pages/inventory/RawMaterials'
import AddRawMaterial from './pages/inventory/AddRawMaterial'
import ItemRecipes from './pages/inventory/ItemRecipes'
import AddRecipe from './pages/inventory/AddRecipe'
import EditRecipe from './pages/inventory/EditRecipe'
import SuppliersThirdParty from './pages/inventory/SuppliersThirdParty'
import AddSupplier from './pages/inventory/AddSupplier'
import PurchaseBillPayments from './pages/inventory/PurchaseBillPayments'
import Units from './pages/inventory/Units'
import AddUnit from './pages/inventory/AddUnit'
import InvoiceTemplates from './pages/inventory/InvoiceTemplates'
import InvoiceTemplateFullscreen from './pages/inventory/InvoiceTemplateFullscreen'
import FinanceDashboard from './pages/finance/FinanceDashboard'
import FinanceTransactions from './pages/finance/FinanceTransactions'
import FinanceExpenses from './pages/finance/FinanceExpenses'
import FinanceMarketplace from './pages/finance/FinanceMarketplace'
import MarketingAutomation from './pages/MarketingAutomation'
import DayEndSummary from './pages/reports/DayEndSummary'
import OtherReportsPage from './pages/reports/OtherReports'
import ReportNotification from './pages/reports/ReportNotification'
import AddReportNotification from './pages/reports/AddReportNotification'
import DeliveryManagement from './pages/reports/DeliveryManagement'
import ManagementPlaceholder from './pages/management/ManagementPlaceholder'
import OutletConfiguration from './pages/management/OutletConfiguration'
import OutletDetails from './pages/management/OutletDetails'
import ContactDetails from './pages/management/ContactDetails'
import OutletTimings from './pages/management/OutletTimings'
import OutletPayment from './pages/management/OutletPayment'
import InvoiceSequence from './pages/management/InvoiceSequence'
import AddInvoiceSequence from './pages/management/AddInvoiceSequence'
import FloorPlan from './pages/management/FloorPlan'
import DisplaySettings from './pages/management/DisplaySettings'
import PrintLogoSettings from './pages/management/PrintLogoSettings'
import CalculationSettings from './pages/management/CalculationSettings'
import ConnectedServicesSettings from './pages/management/ConnectedServicesSettings'
import PrintSettings from './pages/management/PrintSettings'
import CustomerSettings from './pages/management/CustomerSettings'
import OnlineOrderConfiguration from './pages/management/OnlineOrderConfiguration'
import BillingSystemSettings from './pages/management/BillingSystemSettings'
import SmsConfiguration from './pages/management/SmsConfiguration'
import SubOrderType from './pages/management/SubOrderType'
import AddSubOrderType from './pages/management/AddSubOrderType'
import DeliveryDistance from './pages/management/DeliveryDistance'
import AddDeliveryDistance from './pages/management/AddDeliveryDistance'
import AreaLocalityDeliveryCharges from './pages/management/AreaLocalityDeliveryCharges'
import AddAreaLocalityDeliveryCharge from './pages/management/AddAreaLocalityDeliveryCharge'
import EmailTemplateSettings from './pages/management/EmailTemplateSettings'
import PaymentInformation from './pages/management/PaymentInformation'
import VirtualWallet from './pages/management/VirtualWallet'
import OnlineOrderReconciliation from './pages/management/OnlineOrderReconciliation'
import GstInformation from './pages/management/GstInformation'
import UtilityBills from './pages/management/UtilityBills'
import AddUtilityBillOperator from './pages/management/AddUtilityBillOperator'
import ExpenseWithdrawal from './pages/management/ExpenseWithdrawal'
import AddExpense from './pages/management/AddExpense'
import ServicePaymentHistory from './pages/management/ServicePaymentHistory'
import LoanInformation from './pages/management/LoanInformation'
import Denomination from './pages/management/Denomination'
import AddDenomination from './pages/management/AddDenomination'
import BillerApp from './pages/management/BillerApp'
import AddBiller from './pages/management/AddBiller'
import OnlineStoreLogs from './pages/management/OnlineStoreLogs'
import OnlineItemOnOffLogs from './pages/management/OnlineItemOnOffLogs'
import AutoAcceptChangeLogs from './pages/management/AutoAcceptChangeLogs'
import SupportManagement from './pages/management/SupportManagement'
import NotificationLogs from './pages/management/NotificationLogs'
import MenuTriggerLogs from './pages/management/MenuTriggerLogs'
import ClosingHourLogs from './pages/management/ClosingHourLogs'
import ExpenseLogsPage from './pages/management/ExpenseLogsPage'
import WithdrawalLogsPage from './pages/management/WithdrawalLogsPage'
import CashTopUpLogsPage from './pages/management/CashTopUpLogsPage'
import MarketplacePage from './pages/management/MarketplacePage'
import MarketplaceSettingPage from './pages/management/MarketplaceSettingPage'
import AuditTrailPage from './pages/management/AuditTrailPage'
import OrderModificationAuditPage from './pages/management/OrderModificationAuditPage'
import AfterPrintModificationPage from './pages/management/AfterPrintModificationPage'
import PaymentChangeHistoryPage from './pages/management/PaymentChangeHistoryPage'
import KotModificationReportPage from './pages/management/KotModificationReportPage'
import CrmMarketingPage from './pages/crm/CrmMarketingPage'
import CrmCampaignPage from './pages/crm/CrmCampaignPage'
import CreateCampaignPage from './pages/crm/CreateCampaignPage'
import CrmCustomersPage from './pages/crm/CrmCustomersPage'
import AddCustomerPage from './pages/crm/AddCustomerPage'
import CustomerDiscountConfigPage from './pages/crm/CustomerDiscountConfigPage'
import EditCustomerPage from './pages/crm/EditCustomerPage'
import CrmFeedbackPage from './pages/crm/CrmFeedbackPage'
import AllRestaurantSalesReport from './pages/reports/AllRestaurantSalesReport'
import OutletItemWiseReport from './pages/reports/OutletItemWiseReport'
import InvoiceReport from './pages/reports/InvoiceReport'
import PaxSalesReport from './pages/reports/PaxSalesReport'
import OrderSubOrderWiseReport from './pages/reports/OrderSubOrderWiseReport'
import AllRestaurantDayWiseReport from './pages/reports/AllRestaurantDayWiseReport'
import OrderSummaryCorporateCustomers from './pages/reports/OrderSummaryCorporateCustomers'
import CancelOrderReport from './pages/reports/CancelOrderReport'
import LocalityWiseReport from './pages/reports/LocalityWiseReport'
import ItemInvoiceDetailsReport from './pages/reports/ItemInvoiceDetailsReport'
import ItemWiseAllRestaurantsReport from './pages/reports/ItemWiseAllRestaurantsReport'
import ItemWiseBrandReport from './pages/reports/ItemWiseBrandReport'
import OnlineOrderReport from './pages/reports/OnlineOrderReport'
import DiscountedOrdersReport from './pages/reports/DiscountedOrdersReport'
import TagWiseReport from './pages/reports/TagWiseReport'
import AdvanceOrdersSummaryReport from './pages/reports/AdvanceOrdersSummaryReport'
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
            path="/finance"
            element={
              <ProtectedRoute>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <MarketingAutomation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/transactions"
            element={
              <ProtectedRoute>
                <FinanceTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/expenses"
            element={
              <ProtectedRoute>
                <FinanceExpenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/marketplace"
            element={
              <ProtectedRoute>
                <FinanceMarketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/day-end-summary"
            element={
              <ProtectedRoute>
                <DayEndSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports"
            element={
              <ProtectedRoute>
                <OtherReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/all-restaurant-sales"
            element={
              <ProtectedRoute>
                <AllRestaurantSalesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/outlet-item-wise"
            element={
              <ProtectedRoute>
                <OutletItemWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/invoice-report"
            element={
              <ProtectedRoute>
                <InvoiceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/pax-sales-report"
            element={
              <ProtectedRoute>
                <PaxSalesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/order-sub-order-wise"
            element={
              <ProtectedRoute>
                <OrderSubOrderWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/all-restaurant-day-wise"
            element={
              <ProtectedRoute>
                <AllRestaurantDayWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/order-summary-corporate"
            element={
              <ProtectedRoute>
                <OrderSummaryCorporateCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/cancel-order-report"
            element={
              <ProtectedRoute>
                <CancelOrderReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/locality-wise"
            element={
              <ProtectedRoute>
                <LocalityWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/item-invoice-details"
            element={
              <ProtectedRoute>
                <ItemInvoiceDetailsReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/item-wise-all-restaurants"
            element={
              <ProtectedRoute>
                <ItemWiseAllRestaurantsReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/item-wise-brand"
            element={
              <ProtectedRoute>
                <ItemWiseBrandReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/online-order-report"
            element={
              <ProtectedRoute>
                <OnlineOrderReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/discounted-orders"
            element={
              <ProtectedRoute>
                <DiscountedOrdersReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/tag-wise"
            element={
              <ProtectedRoute>
                <TagWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/other-reports/advance-orders-summary"
            element={
              <ProtectedRoute>
                <AdvanceOrdersSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/report-notification"
            element={
              <ProtectedRoute>
                <ReportNotification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/report-notification/add"
            element={
              <ProtectedRoute>
                <AddReportNotification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/delivery-management"
            element={
              <ProtectedRoute>
                <DeliveryManagement />
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
            path="/captain-orders"
            element={
              <ProtectedRoute>
                <CaptainOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/table-view"
            element={
              <ProtectedRoute>
                <TableView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screens"
            element={
              <ProtectedRoute>
                <ScreenManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screens/:id"
            element={
              <ProtectedRoute>
                <ScreenDisplay />
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
            path="/inventory/other-reports/consumption-summary"
            element={
              <ProtectedRoute>
                <ConsumptionSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/opening-closing"
            element={
              <ProtectedRoute>
                <OpeningClosingStockReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/food-costing"
            element={
              <ProtectedRoute>
                <FoodCostingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/recipe-costing"
            element={
              <ProtectedRoute>
                <RecipeCostingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/material-purchase"
            element={
              <ProtectedRoute>
                <MaterialPurchaseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/supplier-payment"
            element={
              <ProtectedRoute>
                <SupplierPaymentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/material-transfer"
            element={
              <ProtectedRoute>
                <MaterialTransferReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/transfer-payment"
            element={
              <ProtectedRoute>
                <TransferPaymentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/purchase-sales-return"
            element={
              <ProtectedRoute>
                <PurchaseSalesReturnReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/manual-stock-entry"
            element={
              <ProtectedRoute>
                <ManualStockEntryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/stock-report-timewise"
            element={
              <ProtectedRoute>
                <StockReportTimewise />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/sales-transfer-variance"
            element={
              <ProtectedRoute>
                <SalesTransferVarianceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/raised-po-variance"
            element={
              <ProtectedRoute>
                <RaisedPoVarianceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/purchase-order-received"
            element={
              <ProtectedRoute>
                <PurchaseOrderReceivedReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/semi-finished-food-costing"
            element={
              <ProtectedRoute>
                <SemiFinishedFoodCostingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/payment-ledger"
            element={
              <ProtectedRoute>
                <PaymentLedgerReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/other-reports/expiry-batchwise"
            element={
              <ProtectedRoute>
                <ExpiryBatchwiseInsightReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/raw-materials"
            element={
              <ProtectedRoute>
                <RawMaterials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/raw-materials/new"
            element={
              <ProtectedRoute>
                <AddRawMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/raw-materials/:id/edit"
            element={
              <ProtectedRoute>
                <AddRawMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/item-recipes"
            element={
              <ProtectedRoute>
                <ItemRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/item-recipes/new"
            element={
              <ProtectedRoute>
                <AddRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/item-recipes/:id/edit"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/suppliers"
            element={
              <ProtectedRoute>
                <SuppliersThirdParty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/suppliers/new"
            element={
              <ProtectedRoute>
                <AddSupplier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-bill-payments"
            element={
              <ProtectedRoute>
                <PurchaseBillPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/units"
            element={
              <ProtectedRoute>
                <Units />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/units/new"
            element={
              <ProtectedRoute>
                <AddUnit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/units/:id/edit"
            element={
              <ProtectedRoute>
                <AddUnit />
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
            path="/inventory/invoice-templates"
            element={
              <ProtectedRoute>
                <InvoiceTemplates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/invoice-templates/fullscreen/:tab"
            element={
              <ProtectedRoute>
                <InvoiceTemplateFullscreen />
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
          <Route
            path="/configuration"
            element={
              <ProtectedRoute>
                <Configuration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration/orders"
            element={
              <ProtectedRoute>
                <CurrentOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/day-end"
            element={
              <ProtectedRoute>
                <PlaceholderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <PlaceholderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/cover-size-summary"
            element={
              <ProtectedRoute>
                <CoverSizeReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:reportId"
            element={
              <ProtectedRoute>
                <PlaceholderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration"
            element={
              <ProtectedRoute>
                <ManagementPlaceholder
                  title="Configuration"
                  activeItem="mgmt-configuration"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet"
            element={
              <ProtectedRoute>
                <OutletConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/details"
            element={
              <ProtectedRoute>
                <OutletDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/contact"
            element={
              <ProtectedRoute>
                <ContactDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/timings"
            element={
              <ProtectedRoute>
                <OutletTimings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/payment"
            element={
              <ProtectedRoute>
                <OutletPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/invoice-sequence"
            element={
              <ProtectedRoute>
                <InvoiceSequence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/invoice-sequence/add"
            element={
              <ProtectedRoute>
                <AddInvoiceSequence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/display"
            element={
              <ProtectedRoute>
                <DisplaySettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/print-logo"
            element={
              <ProtectedRoute>
                <PrintLogoSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/calculations"
            element={
              <ProtectedRoute>
                <CalculationSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/connected-services"
            element={
              <ProtectedRoute>
                <ConnectedServicesSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/print"
            element={
              <ProtectedRoute>
                <PrintSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/customer"
            element={
              <ProtectedRoute>
                <CustomerSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/online-advance"
            element={
              <ProtectedRoute>
                <OnlineOrderConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/billing-system"
            element={
              <ProtectedRoute>
                <BillingSystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/outlet/sms"
            element={
              <ProtectedRoute>
                <SmsConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/sub-order-type"
            element={
              <ProtectedRoute>
                <SubOrderType />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/sub-order-type/add"
            element={
              <ProtectedRoute>
                <AddSubOrderType />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/sub-order-type/edit/:id"
            element={
              <ProtectedRoute>
                <AddSubOrderType />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/delivery-distance"
            element={
              <ProtectedRoute>
                <DeliveryDistance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/delivery-distance/add"
            element={
              <ProtectedRoute>
                <AddDeliveryDistance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/delivery-distance/edit/:id"
            element={
              <ProtectedRoute>
                <AddDeliveryDistance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/area-locality-delivery"
            element={
              <ProtectedRoute>
                <AreaLocalityDeliveryCharges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/area-locality-delivery/add"
            element={
              <ProtectedRoute>
                <AddAreaLocalityDeliveryCharge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/area-locality-delivery/edit/:id"
            element={
              <ProtectedRoute>
                <AddAreaLocalityDeliveryCharge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/floor-plan"
            element={
              <ProtectedRoute>
                <FloorPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/configuration/email-template"
            element={
              <ProtectedRoute>
                <EmailTemplateSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/payment-information"
            element={
              <ProtectedRoute>
                <PaymentInformation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/virtual-wallet"
            element={
              <ProtectedRoute>
                <VirtualWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/online-order-reconciliation"
            element={
              <ProtectedRoute>
                <OnlineOrderReconciliation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/gst-information"
            element={
              <ProtectedRoute>
                <GstInformation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/utility-bills"
            element={
              <ProtectedRoute>
                <UtilityBills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/utility-bills/add"
            element={
              <ProtectedRoute>
                <AddUtilityBillOperator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/expense-withdrawal"
            element={
              <ProtectedRoute>
                <ExpenseWithdrawal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/expense-withdrawal/add"
            element={
              <ProtectedRoute>
                <AddExpense />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/service-payment-history"
            element={
              <ProtectedRoute>
                <ServicePaymentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/loan-information"
            element={
              <ProtectedRoute>
                <LoanInformation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/denomination"
            element={
              <ProtectedRoute>
                <Denomination />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting/denomination/add"
            element={
              <ProtectedRoute>
                <AddDenomination />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/accounting"
            element={
              <Navigate
                to="/management/accounting/payment-information"
                replace
              />
            }
          />
          <Route
            path="/management/user-management"
            element={
              <Navigate
                to="/management/user-management/biller-app"
                replace
              />
            }
          />
          <Route
            path="/management/user-management/biller-app"
            element={
              <ProtectedRoute>
                <BillerApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-management/biller-app/add"
            element={
              <ProtectedRoute>
                <AddBiller />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs"
            element={
              <Navigate
                to="/management/user-logs/online-store"
                replace
              />
            }
          />
          <Route
            path="/management/user-logs/online-store"
            element={
              <ProtectedRoute>
                <OnlineStoreLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/online-item-on-off"
            element={
              <ProtectedRoute>
                <OnlineItemOnOffLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/auto-accept-change"
            element={
              <ProtectedRoute>
                <AutoAcceptChangeLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/support-management"
            element={
              <ProtectedRoute>
                <SupportManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/notification"
            element={
              <ProtectedRoute>
                <NotificationLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/menu-trigger"
            element={
              <ProtectedRoute>
                <MenuTriggerLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/closing-hour"
            element={
              <ProtectedRoute>
                <ClosingHourLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/expense"
            element={
              <ProtectedRoute>
                <ExpenseLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/withdrawal"
            element={
              <ProtectedRoute>
                <WithdrawalLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-logs/cash-top-up"
            element={
              <ProtectedRoute>
                <CashTopUpLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/explore-products"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/explore-products/marketplace"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/explore-products/marketplace-setting"
            element={
              <ProtectedRoute>
                <MarketplaceSettingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/audit-trail"
            element={
              <ProtectedRoute>
                <AuditTrailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/audit-trail/order-modification"
            element={
              <ProtectedRoute>
                <OrderModificationAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/order-modification"
            element={
              <ProtectedRoute>
                <OrderModificationAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/audit-trail/after-print-modification"
            element={
              <ProtectedRoute>
                <AfterPrintModificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/after-print-modification"
            element={
              <ProtectedRoute>
                <AfterPrintModificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/payment-changes"
            element={
              <ProtectedRoute>
                <PaymentChangeHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/audit-trail/after-print-payment"
            element={
              <ProtectedRoute>
                <PaymentChangeHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/kots"
            element={
              <ProtectedRoute>
                <KotModificationReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/audit-trail/kot-modification-report"
            element={
              <ProtectedRoute>
                <KotModificationReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/crm_dashboard"
            element={
              <ProtectedRoute>
                <CrmMarketingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/marketing"
            element={
              <ProtectedRoute>
                <CrmMarketingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/campaign"
            element={
              <ProtectedRoute>
                <CrmCampaignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/send_sms_history"
            element={
              <ProtectedRoute>
                <CrmCampaignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/paid_services"
            element={
              <ProtectedRoute>
                <CrmCampaignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/watsup_services"
            element={
              <ProtectedRoute>
                <CrmCampaignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/campaign/create"
            element={
              <ProtectedRoute>
                <CreateCampaignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/customers"
            element={
              <ProtectedRoute>
                <CrmCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/customer_list"
            element={
              <ProtectedRoute>
                <CrmCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/customers/add"
            element={
              <ProtectedRoute>
                <AddCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/customers/discount-config"
            element={
              <ProtectedRoute>
                <CustomerDiscountConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/customers/edit"
            element={
              <ProtectedRoute>
                <EditCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/customers/edit/:id"
            element={
              <ProtectedRoute>
                <EditCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/feedback"
            element={
              <ProtectedRoute>
                <CrmFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbacks/app_list"
            element={
              <ProtectedRoute>
                <CrmFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbacks/app_list_rating"
            element={
              <ProtectedRoute>
                <CrmFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbacks/customercomplaints"
            element={
              <ProtectedRoute>
                <CrmFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbacks/onlineorderrating"
            element={
              <ProtectedRoute>
                <CrmFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/device-mapping"
            element={
              <ProtectedRoute>
                <ManagementPlaceholder
                  title="Device Mapping"
                  activeItem="mgmt-device-mapping"
                />
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
