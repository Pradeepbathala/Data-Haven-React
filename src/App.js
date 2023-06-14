import React from "react";
import { ToastContainer } from "react-toastify";

import LandingPage from "./components/CommonComponent/LandingPage";
import Login from "./components/CommonComponent/Login";
import Register from "./components/CommonComponent/Register";
import QueryResultTable from './components/CommonComponent/Table';

import Enrichment from "./components/Enrichment";
import QueryStatus from "./components/QueryStatus";
import Sidebar from "./components/CommonComponent/Sidebar";
import Requestinfo from "./components/Requestinfo";
import Home from "./components/Home";
import S3fileupload from "./components/S3fileupload";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MatchRate from "./components/MatchRate";
import PrivacyPolicy from "./components/CommonComponent/PrivacyPolicy";
import TermsAndConditions from "./components/CommonComponent/TermsAndConditions";
import Analytics from "./components/Analytics";
import ConsumerAdmin from "./components/ConsumerAdmin";
import ProviderAdmin from "./components/ProviderAdmin";

// import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          <Route
            path="*"
            element={
              <Sidebar>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/queryform" element={<Enrichment />} />
                  <Route path="/querystatus" element={<QueryStatus />} />
                  <Route path="/requestinfo" element={<Requestinfo />} />
                  <Route path="/publisherform" element={<MatchRate />} />
                  <Route path="/s3fileupload" element={<S3fileupload />} />
                  <Route path="/query-result-table" element={<QueryResultTable />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/consumer-admin" element={<ConsumerAdmin />} />
                  <Route path="/provider-admin" element={<ProviderAdmin />} />
                </Routes>
              </Sidebar>
            }
          />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
