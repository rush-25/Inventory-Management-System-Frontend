import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Categories } from "./pages/Categories";
import { Suppliers } from "./pages/Suppliers";
import { Products } from "./pages/Products";
import { StockIn } from "./pages/StockIn";
import { StockOut } from "./pages/StockOut";
import { StockBalance } from "./pages/StockBalance";
import { LowStock } from "./pages/LowStock";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedDashboard,
    children: [
      { index: true, Component: Dashboard },
      { path: "categories", Component: Categories },
      { path: "suppliers", Component: Suppliers },
      { path: "products", Component: Products },
      { path: "stock-in", Component: StockIn },
      { path: "stock-out", Component: StockOut },
      { path: "stock-balance", Component: StockBalance },
      { path: "low-stock", Component: LowStock },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
