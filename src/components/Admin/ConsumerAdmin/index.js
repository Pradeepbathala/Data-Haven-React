import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, Tab } from "@mui/material";

import ProfileTable from "../components/ProfilesTable";
import ItemisedBills from "../components/ItemisedBills";

const ConsumerAdmin = () => {
  const state = useSelector((state) => state);
  const user = state && state.user;
  const UserRole = state && state.user && state.user.role;

  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <div className="flex flex-col w-full">
      <div className="flex h-12 sticky top-0 z-30 py-2 bg-amaranth-800 flex-row items-center justify-between w-full">
        <h3 className="px-5 text-lg font-light text-white">Admin Console</h3>
      </div>

      <div className="p-4">
        {/* <div className="my-4">
          <h3 className="text-lg font-bold text-amaranth-900 uppercase">
            Configure Templates
          </h3>
        </div> */}
        <Tabs value={activeTab} onChange={handleTabChange} className="mt-4">
          <Tab
            className="text-amaranth-600 !important uppercase"
            label="PROFILES"
            value={1}
          />
          <Tab
            className="text-amaranth-600 !important uppercase"
            label="ITEMISED BILLS"
            value={2}
          />
        </Tabs>
      </div>

      {activeTab === 1 && <ProfileTable user={user} UserRole={UserRole} />}

      {activeTab === 2 && <ItemisedBills user={user} />}
    </div>
  );
};

export default ConsumerAdmin;
