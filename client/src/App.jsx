// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* Public */
import PublicLayout from "./components/PublicLayout.jsx";
import Landing from "./pages/LandinPage.jsx";
import PricingPage from "./payment/PricingPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
/* Auth / App */

import Login from "./pages/Login.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

/* App pages */
import Dashboard from "./pages/Dashboard.jsx";
import ClientsList from "./pages/clients/ClientsList.jsx";
import ClientForm from "./pages/clients/ClientForm.jsx";
import ClientDetail from "./pages/clients/ClientDetail.jsx";
import ServicesList from "./pages/services/ServicesList.jsx";
import ServiceForm from "./pages/services/ServiceForm.jsx";
import ServiceDetail from "./pages/services/ServiceDetail.jsx"; // adjust if path differs
import BillingList from "./pages/billing/BillingList.jsx";
import BillingForm from "./pages/billing/BillingForm.jsx";
import Invoice from "./pages/billing/Invoice.jsx";
import RemindersList from "./pages/reminders/RemindersList.jsx";
import Reports from "./pages/reports/Reports.jsx";
import DetailsPage from "./pages/details/DetailsPage.jsx";
import { ThemeProvider } from './contexts/ThemeContext';

import CarGarage from "./pages/garages/CarGarage.jsx";
import BikeGarage from "./pages/garages/BikeGarage.jsx";
import WashingCenter from "./pages/garages/WashingCenter.jsx";
import BikeSpareParts from "./pages/spareparts/BikeSpareParts.jsx";
import CarSpareParts from "./pages/spareparts/CarSpareParts.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import ClientsLayout from "./components/ClientLayout.jsx";
import CarRegister from "./pages/CarRegister.jsx";
import TermsPage from "./pages/terms.jsx";
import Profile from "./components/Profile.jsx";
import Plans from "./pages/plans/Plans.jsx";
import RefundPage from "./pages/RefundT&C.jsx";
import ReferencePage from "./pages/ReferenceT&C.jsx";
import UpgradePlans from "./payment/upgrade/UpgradePlans.jsx";
import BikeDashboard from "./bikePages/BikeDashboard.jsx";

import Reference from "./pages/Reference.jsx";
import BikeRegister from "./pages/BikeRegister.jsx";
import WashRegister from "./pages/WashRegister.jsx";
import BikeLayoutPage from "./components/BikeLayoutPage.jsx";
import Clients from "./bikePages/client/Clients.jsx";
import Services from "./bikePages/services/services.jsx";
import Billings from "./bikePages/Billing/Billings.jsx";
import Reminders from "./bikePages/Reminders/Reminders.jsx";
import Report from "./bikePages/Reports/Reports.jsx";
import OCRScanner from "./bikePages/OCRScanner/OCRScanner.jsx";
import WashingLayout from "./components/WashingLayout.jsx";
import Client from "./washPages/client/Client.jsx";
import Service from "./washPages/services/Services.jsx";
import Bill from "./washPages/billing/Billing.jsx";
import Repor from "./washPages/reports/Reports.jsx";
import Referenc from "./washPages/reference/Reference.jsx";
import Upgra from "./washPages/upgrade/Upgrade.jsx";

import SMSalert from "./washPages//sms/sms.jsx"
import Plan from "./washPages/plans/Plans.jsx";
import Newclient from "./washPages/client/AddClient.jsx"
import AddNewServiceForm from "./washPages/services/AddService.jsx"
import NewInvoice from "./washPages/billing/NewInvoice.jsx"

import WashingProfile from "./components/WashingProfile.jsx"
import AddClients from "./bikePages/client/AddClients.jsx";
import BikeDetail from "./bikePages/client/clientDetail.jsx";
import AddService from "./bikePages/services/AddService.jsx";
import ServiceDetails from "./bikePages/services/ServiceDetails.jsx";
import AddBilling from "./bikePages/Billing/AddBilling.jsx";
import InvoiceBill from "./bikePages/Billing/InvoiceBill.jsx";
import BikeProfile from "./components/BikeProfile.jsx";
import WashDashboard from "./washPages/WashDashboard.jsx";
import ClientsDetails from "./washPages/client/ClientsDetails.jsx";
import WServiceDetails from "./washPages/services/WServiceDetails.jsx";
import BillingInvoice from "./washPages/billing/BillingInvoice.jsx"
import Billing from "./washPages/billing/Billing.jsx";








function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />

      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="car-garage" element={<CarGarage />} />
          <Route path="bike-garage" element={<BikeGarage />} />
          <Route path="washing-center" element={<WashingCenter />} />
          <Route path="spare-parts/bike" element={<BikeSpareParts />} />
          <Route path="spare-parts/car" element={<CarSpareParts />} />
          <Route path="contactus" element={<ContactUs />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="term&conditions" element={<RefundPage />} />
          <Route path="referencet&c" element={<ReferencePage />} />
        </Route>

        {/* ================= AUTH ================= */}
        <Route path="login" element={<Login />} />
        <Route path="car-register" element={<CarRegister />} />
        <Route path="bike-register" element={<BikeRegister />} />
        <Route path="washing-register" element={<WashRegister />} />

        {/* Car routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="car-dashboard" />} />
          <Route path="car-dashboard" element={<Dashboard />} />

          <Route path="clients" element={<ClientsList />} />
          <Route path="clients/new" element={<ClientForm />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="clients/:id/edit" element={<ClientForm />} />

          <Route path="services" element={<ServicesList />} />
          <Route path="services/new" element={<ServiceForm />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/:id/edit" element={<ServiceForm />} />

          <Route path="billing" element={<BillingList />} />
          <Route path="billing/new" element={<BillingForm />} />
          <Route path="billing/:id" element={<Invoice />} />
          <Route path="billing/:id/edit" element={<BillingForm />} />

          <Route path="reminders" element={<RemindersList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="plan" element={<Plans />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reference" element={<Reference />} />
          <Route path="upgrade" element={<UpgradePlans />} />
        </Route>

        {/* ================= BIKE CRM ================= */}
        <Route path="/" element={<BikeLayoutPage />}>
          <Route path="bike-dashboard" element={<BikeDashboard />} />
          <Route path="/bike-profile" element={<BikeProfile />} />
          <Route path="bike-clients" element={<Clients />} />
          <Route path="bike-services" element={<Services />} />
          <Route path="bike-billing" element={<Billings />} />
          <Route path="bike-reminders" element={<Reminders />} />
          <Route path="bike-reports" element={<Report />} />
          <Route path="bike-plan" element={<Plans />} />
          <Route path="bike-reference" element={<Reference />} />
          <Route path="bike-upgrade" element={<UpgradePlans />} />

          <Route path="/editclient/:id" element={<AddClients />} />
          <Route path="/editclient/new" element={<AddClients />} />
          <Route path="/bikes/:id" element={<BikeDetail />} />
          <Route path="/bike-services/add" element={<AddService />} />
          <Route path="/bike-services/:id" element={<ServiceDetails />} />
          <Route path="/bike-services/:id/edit" element={<AddService />} />
          <Route path="/bill/new" element={<AddBilling />} />
          <Route path="/bill/:id/edit" element={<AddBilling />} />
          <Route path="/bill/:id" element={<InvoiceBill />} />
        </Route>


        {/* ================= WASHING CRM ================= */}
        <Route element={<WashingLayout />}>
          <Route path="wash-dashboard" element={<WashDashboard />} />
          <Route path="washing-clients" element={<Client />} />
          <Route path="washing-services" element={<Service />} />
          <Route path="washing-billing" element={<Bill />} />
          <Route path="washing-reports" element={<Repor />} />
          <Route path="washing-reference" element={<Referenc />} />
          <Route path="washing-upgrade" element={<Upgra />} />
          <Route path="washing-alerts" element={<SMSalert />} />
          <Route path="washing-plan" element={<Plan />} />


          <Route path="/wservices-details/:id" element={<WServiceDetails />} />
          <Route path="/add-service" element={<AddNewServiceForm />} />
          <Route path="/add-service/:id" element={<AddNewServiceForm />} />



          <Route path="washProfile" element={<WashingProfile />} />
          <Route path="/client-details/:id" element={<ClientsDetails />} />
          <Route path="addclient" element={<Newclient />} />
          <Route path="/addclient/:id" element={<Newclient />} />
          <Route path="/billing" element={<Billing />} />

          <Route
            path="/billing/invoice/:id"
            element={<BillingInvoice />}
          />

          <Route
            path="/billing/create-invoice"
            element={<NewInvoice />}
          />

          <Route
            path="/billing/create-invoice/:serviceId"
            element={<NewInvoice />}
          />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </ThemeProvider>
  );
}


export default App;
