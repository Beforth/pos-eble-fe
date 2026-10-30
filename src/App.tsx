import { useEffect, type ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TooltipHost } from './components/common/TooltipHost'
import { ToastHost } from './components/common/ToastHost'
import { AuthProvider, ProtectedRoute, useAuth } from './auth/AuthContext'
import { RoleProvider } from './state/RoleContext'
import { InventoryMastersProvider } from './state/InventoryMastersContext'
import { MenuChannelsProvider } from './state/MenuChannelsContext'
import { MenuReferenceProvider } from './state/MenuReferenceContext'
import { ChromeProvider } from './state/ChromeContext'
import { GlobalNavigationShortcuts } from './components/layout/GlobalNavigationShortcuts'
import { OnlineOrdersProvider } from './state/OnlineOrdersContext'
import AcceptOnlineOrders from './pages/AcceptOnlineOrders'
import AllOrders from './pages/AllOrders'
import Dashboard from './pages/Dashboard'
import EditProfile from './pages/EditProfile'
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
import AddOutlet from './pages/AddOutlet'
import AddCombo from './pages/AddCombo'
import AddCommission from './pages/AddCommission'
import AddMenuItem from './pages/AddMenuItem'
import BackwardTaxPrintingSettings from './pages/BackwardTaxPrintingSettings'
import BaseMenu from './pages/BaseMenu'
import Billing from './pages/billing/Billing'
import CaptainOrders from './pages/captainorders/CaptainOrders'
import CaptainOrdersLiveOrders from './pages/captainorders/CaptainOrdersLiveOrders'
import CaptainOrdersAllOrders from './pages/captainorders/CaptainOrdersAllOrders'
import CaptainOrdersKot from './pages/captainorders/CaptainOrdersKot'
import CategoryManagement from './pages/CategoryManagement'
import DineInMenu from './pages/DineInMenu'
import DiscountsManagement from './pages/DiscountsManagement'
import EditAddonGroup from './pages/EditAddonGroup'
import EditCategory from './pages/EditCategory'
import EditMenuItem from './pages/EditMenuItem'
import EditParentCategory from './pages/EditParentCategory'
import AddGroup from './pages/AddGroup'
import EditTax from './pages/EditTax'
import HomeDeliveryMenu from './pages/HomeDeliveryMenu'
import ItemOrderWiseTaxSettings from './pages/ItemOrderWiseTaxSettings'
import MenuManagement from './pages/MenuManagement'
import MultiItemImagesUpload from './pages/MultiItemImagesUpload'
import OnlineOrders from './pages/OnlineOrders'
import DuePayments from './pages/due-payments/DuePayments'
import DuePaymentClient from './pages/due-payments/DuePaymentClient'
import ParcelMenu from './pages/ParcelMenu'
import Configuration from './pages/Configuration'
import CurrentOrders from './pages/configuration/CurrentOrders'
import Customers from './pages/customer-screen/Customers'
import Feedback from './pages/Feedback'
import BillingSettings from './pages/billing/BillingSettings'
import BillingCashFlow from './pages/billing/BillingCashFlow'
import AssigneeWiseSummaryReport from './pages/reports/AssigneeWiseSummaryReport'
import NcItemSummaryReport from './pages/reports/NcItemSummaryReport'
import SettlementSummaryReport from './pages/reports/SettlementSummaryReport'
import CaptainWiseSummaryReport from './pages/reports/CaptainWiseSummaryReport'
import LocalitySummaryReport from './pages/reports/LocalitySummaryReport'
import TipSummaryReport from './pages/reports/TipSummaryReport'
import ReportsHub from './pages/reports/ReportsHub'
import NotificationListing from './pages/billing/NotificationListing'
import BillerProfiles from './pages/billing/BillerProfiles'
import InventoryManagement from './pages/configuration/InventoryManagement'
import BillingLedDisplay from './pages/billing/BillingLedDisplay'
import CustomerDisplay from './pages/customer-screen/CustomerDisplay'
import CoverSizeReport from './pages/reports/CoverSizeReport'
import TableView from './pages/TableView'
import SwiggyMenu from './pages/SwiggyMenu'
import SpecialNote from './pages/SpecialNote'
import SetItemCommission from './pages/SetItemCommission'
import MenuOnOff from './pages/MenuOnOff'
import ScheduleChanges from './pages/ScheduleChanges'
import ScheduleChannelMenu from './pages/ScheduleChannelMenu'
import PhysicalMenu from './pages/PhysicalMenu'
import InventoryDashboard from './pages/inventory/InventoryDashboard'
import InventorySettings from './pages/inventory/InventorySettings'
import InventoryPlaceholder from './pages/inventory/InventoryPlaceholder'
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
import InventoryCategories from './pages/inventory/InventoryCategories'
import AddInventoryCategory from './pages/inventory/AddInventoryCategory'
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
import OutletDocuments from './pages/management/OutletDocuments'
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
import Denomination from './pages/management/Denomination'
import AddDenomination from './pages/management/AddDenomination'
import BillerApp from './pages/management/BillerApp'
import AddBiller from './pages/management/AddBiller'
import ViewBiller from './pages/management/ViewBiller'
import RoleManagement from './pages/management/RoleManagement'
import AddRole from './pages/management/AddRole'
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
import MarketplaceSettingPage from './pages/management/MarketplaceSettingPage'
import AuditTrailPage from './pages/management/AuditTrailPage'
import OrderModificationAuditPage from './pages/management/OrderModificationAuditPage'
import AfterPrintModificationPage from './pages/management/AfterPrintModificationPage'
import PaymentChangeHistoryPage from './pages/management/PaymentChangeHistoryPage'
import KotModificationReportPage from './pages/management/KotModificationReportPage'

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
import LogsPage from './pages/LogsPage'
import CategorySummaryReport from './pages/reports/CategorySummaryReport'
import ItemSummaryReport from './pages/reports/ItemSummaryReport'
import SalesSummaryReport from './pages/reports/SalesSummaryReport'
import OrderSummaryReport from './pages/reports/OrderSummaryReport'
import ExecutiveSalesSummaryReport from './pages/reports/ExecutiveSalesSummaryReport'
import EmployeeSummaryReport from './pages/reports/EmployeeSummaryReport'
import GroupSummaryReport from './pages/reports/GroupSummaryReport'
import VariationSummaryReport from './pages/reports/VariationSummaryReport'
import TaxSummaryReport from './pages/reports/TaxSummaryReport'
import CounterSummaryReport from './pages/reports/CounterSummaryReport'
import BillingAllOrders from './pages/billing/BillingAllOrders'
import BillingLiveOrders from './pages/billing/BillingLiveOrders'
import BillingKot from './pages/billing/BillingKot'
import BillingDayEnd from './pages/billing/BillingDayEnd'
import BillingPrinters from './pages/billing/BillingPrinters'
import BillingExpenses from './pages/billing/BillingExpenses'
import BillingExpenseDate from './pages/billing/BillingExpenseDate'
import BillingExpenseDetails from './pages/billing/BillingExpenseDetails'
import BillingWithdrawals from './pages/billing/BillingWithdrawals'
import BillingWithdrawalDetails from './pages/billing/BillingWithdrawalDetails'
import BillingTaxes from './pages/billing/BillingTaxes'
import BillingDiscounts from './pages/billing/BillingDiscounts'
import BillingDuePayments from './pages/billing/BillingDuePayments'
import BillingOnlineOrders from './pages/billing/BillingOnlineOrders'
import BillingAdvanceOrders from './pages/billing/BillingAdvanceOrders'
import BillingCustomOrderStatus from './pages/billing/BillingCustomOrderStatus'
import BillingDeliveryBoys from './pages/billing/BillingDeliveryBoys'
import BillingDeliveryBoyForm from './pages/billing/BillingDeliveryBoyForm'
import BillingCurrencyConversion from './pages/billing/BillingCurrencyConversion'
import BillingComingSoon from './pages/billing/BillingComingSoon'
import BillingOperations from './pages/billing/BillingOperations'
import BillingLiveView from './pages/billing/BillingLiveView'
import BillingReports from './pages/billing/BillingReports'
import ZomatoMenu from './pages/ZomatoMenu'
import TablesAreasManagement from './pages/TablesAreasManagement'
import TaxesManagement from './pages/TaxesManagement'
import VariantsManagement from './pages/VariantsManagement'

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  // Dialogs lock the page scroll while open and put it back when they close; two
  // dialogs closed in the other order leave it locked. A new page always starts
  // scrollable, so that never carries over.
  useEffect(() => {
    document.body.style.overflow = ''
  }, [location.pathname])
  return (
    <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>
  )
}

/** Sends admins to /dashboard and everyone else to their first open screen. */
function HomeRedirect() {
  const { homePath } = useAuth()
  return <Navigate to={homePath()} replace />
}

export default function App() {
  return (
    <RoleProvider>
      <InventoryMastersProvider>
      <AuthProvider>
        <MenuChannelsProvider>
          <MenuReferenceProvider>
          <BrowserRouter>
          <ChromeProvider>
          <OnlineOrdersProvider>
          <GlobalNavigationShortcuts />
          <TooltipHost />
          <ToastHost />
          <RouteErrorBoundary>
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
            path="/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
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
            path="/online-orders/accept"
            element={
              <ProtectedRoute>
                <AcceptOnlineOrders />
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
            path="/due-payments"
            element={
              <ProtectedRoute>
                <DuePayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/due-payments/:clientId"
            element={
              <ProtectedRoute>
                <DuePaymentClient />
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
            path="/billing/all-orders"
            element={
              <ProtectedRoute>
                <BillingAllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/printers"
            element={
              <ProtectedRoute>
                <BillingPrinters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/expenses"
            element={
              <ProtectedRoute>
                <BillingExpenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/expenses/add"
            element={
              <ProtectedRoute>
                <BillingExpenseDate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/expenses/:date"
            element={
              <ProtectedRoute>
                <BillingExpenseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/withdrawals"
            element={
              <ProtectedRoute>
                <BillingWithdrawals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/withdrawals/:date"
            element={
              <ProtectedRoute>
                <BillingWithdrawalDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/menu"
            element={
              <ProtectedRoute>
                <MenuManagement standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/calculations"
            element={
              <ProtectedRoute>
                <CalculationSettings standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/connected-services"
            element={
              <ProtectedRoute>
                <ConnectedServicesSettings standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/print"
            element={
              <ProtectedRoute>
                <PrintSettings standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/customer"
            element={
              <ProtectedRoute>
                <CustomerSettings standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/online-order"
            element={
              <ProtectedRoute>
                <OnlineOrderConfiguration standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/billing-system"
            element={
              <ProtectedRoute>
                <BillingSystemSettings standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings/display"
            element={
              <ProtectedRoute>
                <DisplaySettings standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/settings"
            element={
              <ProtectedRoute>
                <BillingSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/menu-on-off"
            element={
              <ProtectedRoute>
                <MenuOnOff standalone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/taxes"
            element={
              <ProtectedRoute>
                <BillingTaxes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/discounts"
            element={
              <ProtectedRoute>
                <BillingDiscounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/due-payments"
            element={
              <ProtectedRoute>
                <BillingDuePayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/online-orders"
            element={
              <ProtectedRoute>
                <BillingOnlineOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/advance-orders"
            element={
              <ProtectedRoute>
                <BillingAdvanceOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/live-orders"
            element={
              <ProtectedRoute>
                <BillingLiveView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/kot"
            element={
              <ProtectedRoute>
                <BillingKot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/live-summary"
            element={
              <ProtectedRoute>
                <BillingLiveOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/operations"
            element={
              <ProtectedRoute>
                <BillingOperations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/custom-order-status"
            element={
              <ProtectedRoute>
                <BillingCustomOrderStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/delivery-boys"
            element={
              <ProtectedRoute>
                <BillingDeliveryBoys />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/delivery-boys/new"
            element={
              <ProtectedRoute>
                <BillingDeliveryBoyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/delivery-boys/:id/edit"
            element={
              <ProtectedRoute>
                <BillingDeliveryBoyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/cashflow"
            element={
              <ProtectedRoute>
                <BillingCashFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/cash-top-up"
            element={
              <ProtectedRoute>
                <BillingComingSoon title="Cash Top-Up" description="Add cash to the till." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/currency-conversion"
            element={
              <ProtectedRoute>
                <BillingCurrencyConversion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/biller-profiles"
            element={
              <ProtectedRoute>
                <BillerProfiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/led-display"
            element={
              <ProtectedRoute>
                <BillingLedDisplay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/manual-sync"
            element={
              <ProtectedRoute>
                <BillingComingSoon
                  title="Manual Sync"
                  description="Pull the latest menu and settings now."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/alerts"
            element={
              <ProtectedRoute>
                <NotificationListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/shortcuts"
            element={
              <ProtectedRoute>
                <BillingComingSoon
                  title="Shortcuts"
                  description="Keyboard shortcuts for the billing screen."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/language-profiles"
            element={
              <ProtectedRoute>
                <BillingComingSoon
                  title="Language Profiles"
                  description="Choose the language used on bills and screens."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/day-end"
            element={
              <ProtectedRoute>
                <BillingDayEnd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/reports/:slug"
            element={
              <ProtectedRoute>
                <BillingReports />
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
            path="/captain-orders/live-orders"
            element={
              <ProtectedRoute>
                <CaptainOrdersLiveOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/captain-orders/all-orders"
            element={
              <ProtectedRoute>
                <CaptainOrdersAllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/captain-orders/kot"
            element={
              <ProtectedRoute>
                <CaptainOrdersKot />
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
            path="/inventory/settings"
            element={
              <ProtectedRoute>
                <InventorySettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory"
            element={
              <ProtectedRoute>
                <InventoryManagement />
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
            path="/inventory/purchase/:id/edit"
            element={
              <ProtectedRoute>
                <AddPurchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase/:id/view"
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
            path="/inventory/purchase-order/:id/edit"
            element={
              <ProtectedRoute>
                <AddPurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-order/:id/view"
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
            path="/inventory/purchase-return/:id/edit"
            element={
              <ProtectedRoute>
                <AddPurchaseReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchase-return/:id/view"
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
            path="/inventory/sales/:id/edit"
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
            path="/inventory/transfer/:id/edit"
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
            path="/inventory/wastage/:id/edit"
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
            path="/inventory/sales-return/:id/edit"
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
            path="/inventory/production-master/:id/edit"
            element={
              <ProtectedRoute>
                <AddProduction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/production-master/:id/view"
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
            path="/inventory/suppliers/:id/edit"
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
                <InventoryCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/categories/new"
            element={
              <ProtectedRoute>
                <AddInventoryCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/categories/:id/edit"
            element={
              <ProtectedRoute>
                <AddInventoryCategory />
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
            path="/billing/inventory/old"
            element={
              <ProtectedRoute>
                <InventoryOldDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase"
            element={
              <ProtectedRoute>
                <StockPurchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase/new"
            element={
              <ProtectedRoute>
                <AddPurchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase-order"
            element={
              <ProtectedRoute>
                <PurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase-order/new"
            element={
              <ProtectedRoute>
                <AddPurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase-return"
            element={
              <ProtectedRoute>
                <PurchaseReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase-return/new"
            element={
              <ProtectedRoute>
                <AddPurchaseReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/available-stock"
            element={
              <ProtectedRoute>
                <AvailableStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/closing-stock"
            element={
              <ProtectedRoute>
                <ClosingStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/sales/new"
            element={
              <ProtectedRoute>
                <AddSales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/transfer"
            element={
              <ProtectedRoute>
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/transfer/new"
            element={
              <ProtectedRoute>
                <AddTransfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/wastage"
            element={
              <ProtectedRoute>
                <Wastage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/wastage/new"
            element={
              <ProtectedRoute>
                <AddWastage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/sales-return"
            element={
              <ProtectedRoute>
                <SalesReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/sales-return/new"
            element={
              <ProtectedRoute>
                <AddSalesReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/production-master"
            element={
              <ProtectedRoute>
                <ProductionMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/production-master/new"
            element={
              <ProtectedRoute>
                <AddProduction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/production-execution"
            element={
              <ProtectedRoute>
                <ProductionExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/barcode-generation"
            element={
              <ProtectedRoute>
                <BarcodeGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/barcode-generation/configuration"
            element={
              <ProtectedRoute>
                <BarcodeConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/current-stock"
            element={
              <ProtectedRoute>
                <CurrentStockReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/stock-summary"
            element={
              <ProtectedRoute>
                <StockSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/orderwise-consumption"
            element={
              <ProtectedRoute>
                <OrderwiseConsumptionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports"
            element={
              <ProtectedRoute>
                <OtherReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/consumption-summary"
            element={
              <ProtectedRoute>
                <ConsumptionSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/opening-closing"
            element={
              <ProtectedRoute>
                <OpeningClosingStockReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/food-costing"
            element={
              <ProtectedRoute>
                <FoodCostingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/recipe-costing"
            element={
              <ProtectedRoute>
                <RecipeCostingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/material-purchase"
            element={
              <ProtectedRoute>
                <MaterialPurchaseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/supplier-payment"
            element={
              <ProtectedRoute>
                <SupplierPaymentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/material-transfer"
            element={
              <ProtectedRoute>
                <MaterialTransferReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/transfer-payment"
            element={
              <ProtectedRoute>
                <TransferPaymentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/purchase-sales-return"
            element={
              <ProtectedRoute>
                <PurchaseSalesReturnReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/manual-stock-entry"
            element={
              <ProtectedRoute>
                <ManualStockEntryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/stock-report-timewise"
            element={
              <ProtectedRoute>
                <StockReportTimewise />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/sales-transfer-variance"
            element={
              <ProtectedRoute>
                <SalesTransferVarianceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/raised-po-variance"
            element={
              <ProtectedRoute>
                <RaisedPoVarianceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/purchase-order-received"
            element={
              <ProtectedRoute>
                <PurchaseOrderReceivedReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/semi-finished-food-costing"
            element={
              <ProtectedRoute>
                <SemiFinishedFoodCostingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/payment-ledger"
            element={
              <ProtectedRoute>
                <PaymentLedgerReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/other-reports/expiry-batchwise"
            element={
              <ProtectedRoute>
                <ExpiryBatchwiseInsightReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/raw-materials"
            element={
              <ProtectedRoute>
                <RawMaterials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/raw-materials/new"
            element={
              <ProtectedRoute>
                <AddRawMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/raw-materials/:id/edit"
            element={
              <ProtectedRoute>
                <AddRawMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/item-recipes"
            element={
              <ProtectedRoute>
                <ItemRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/item-recipes/new"
            element={
              <ProtectedRoute>
                <AddRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/item-recipes/:id/edit"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/suppliers"
            element={
              <ProtectedRoute>
                <SuppliersThirdParty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/suppliers/new"
            element={
              <ProtectedRoute>
                <AddSupplier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/purchase-bill-payments"
            element={
              <ProtectedRoute>
                <PurchaseBillPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/units"
            element={
              <ProtectedRoute>
                <Units />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/units/new"
            element={
              <ProtectedRoute>
                <AddUnit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/units/:id/edit"
            element={
              <ProtectedRoute>
                <AddUnit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/categories"
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
            path="/billing/inventory/invoice-templates"
            element={
              <ProtectedRoute>
                <InvoiceTemplates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing/inventory/invoice-templates/fullscreen/:tab"
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
            path="/menu/menu-on-off"
            element={
              <ProtectedRoute>
                <MenuOnOff />
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
            path="/menu/add-outlet"
            element={
              <ProtectedRoute>
                <AddOutlet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/add-combo"
            element={
              <ProtectedRoute>
                <AddCombo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/add-item"
            element={
              <ProtectedRoute>
                <AddMenuItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/add-commission"
            element={
              <ProtectedRoute>
                <AddCommission />
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
            path="/base-menu"
            element={<Navigate to="/menu/base-menu" replace />}
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
            path="/menu/categories/group/new"
            element={
              <ProtectedRoute>
                <AddGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/categories/parent/new"
            element={
              <ProtectedRoute>
                <EditParentCategory />
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
            path="/configuration/inventory"
            element={<Navigate to="/billing/inventory" replace />}
          />
          <Route
            path="/configuration/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-display"
            element={
              <ProtectedRoute>
                <CustomerDisplay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/day-end"
            element={
              <ProtectedRoute>
                <DayEndSummary />
              </ProtectedRoute>
            }
          />
          <Route path="/logs" element={<Navigate to="/billing/logs" replace />} />
          <Route
            path="/billing/logs"
            element={
              <ProtectedRoute>
                <LogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/tip-summary"
            element={
              <ProtectedRoute>
                <TipSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/locality-summary"
            element={
              <ProtectedRoute>
                <LocalitySummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/captain-wise-summary"
            element={
              <ProtectedRoute>
                <CaptainWiseSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/settlement-summary"
            element={
              <ProtectedRoute>
                <SettlementSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/nc-item-summary"
            element={
              <ProtectedRoute>
                <NcItemSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/assignee-wise-summary"
            element={
              <ProtectedRoute>
                <AssigneeWiseSummaryReport />
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
            path="/reports/category-summary"
            element={
              <ProtectedRoute>
                <CategorySummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/item-summary"
            element={
              <ProtectedRoute>
                <ItemSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/sales-summary"
            element={
              <ProtectedRoute>
                <SalesSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/order-summary"
            element={
              <ProtectedRoute>
                <OrderSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/executive-sales-summary"
            element={
              <ProtectedRoute>
                <ExecutiveSalesSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/employee-summary"
            element={
              <ProtectedRoute>
                <EmployeeSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/group-summary"
            element={
              <ProtectedRoute>
                <GroupSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/variation-summary"
            element={
              <ProtectedRoute>
                <VariationSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/tax-summary"
            element={
              <ProtectedRoute>
                <TaxSummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/counter-summary"
            element={
              <ProtectedRoute>
                <CounterSummaryReport />
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
            path="/management/configuration/outlet/documents"
            element={
              <ProtectedRoute>
                <OutletDocuments />
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
            path="/management/user-management/biller-app/edit/:id"
            element={
              <ProtectedRoute>
                <AddBiller />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-management/biller-app/view/:id"
            element={
              <ProtectedRoute>
                <ViewBiller />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-management/roles"
            element={
              <ProtectedRoute>
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-management/roles/add"
            element={
              <ProtectedRoute>
                <AddRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/user-management/roles/:id"
            element={
              <ProtectedRoute>
                <AddRole />
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
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
        </RouteErrorBoundary>
          </OnlineOrdersProvider>
          </ChromeProvider>
      </BrowserRouter>
          </MenuReferenceProvider>
        </MenuChannelsProvider>
    </AuthProvider>
      </InventoryMastersProvider>
  </RoleProvider>
  )
}
