import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import API from "../../../apiServices/api";

const ItemisedBills = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedConsumer, setSelectedConsumer] = useState("");
  const state = useSelector((state) => state);
  const user = state && state.user;
  const [billError, setBillError] = useState("");
  const [consumerList, setConsumerList] = useState([]);

  const handleConsumerChange = (event) => {
    setSelectedConsumer(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleViewBill = () => {
    const selectedValue =
      user?.name + "_" + selectedMonth + "_" + selectedYear + ".pdf";
    const billsFolder = "/bills/";
    const filePath = billsFolder + selectedValue;
    checkIfFileExists(filePath);
  };

  const handleViewBillForProducer = () => {
    const selectedValue =
      selectedConsumer + "_" + selectedMonth + "_" + selectedYear + ".pdf";

    const billsFolder = "/bills/";
    const filePath = billsFolder + selectedValue;
    checkIfFileExists(filePath);
  };

  const checkIfFileExists = async (filePath) => {
    try {
      await axios
        .get(filePath)
        .then((response) => {
          if (response?.status === 200) {
            setBillError("");
            window.open(filePath, "_blank");
          } else {
            console.error("File does not exist");
            setBillError(
              "For selected month and year bill is not generated, please select correct month and year."
            );
          }
        })
        .catch((error) => {
          console.error("File does not exist");
          setBillError(
            "For selected month and year bill is not generated, please select correct month and year."
          );
        });
    } catch (error) {
      console.error("File does not exist");
      setBillError(
        "For selected month and year bill is not generated, please select correct month and year."
      );
    }
  };

  useEffect(() => {
    const getConsumerAdmin = async () => {
      const payload = {
        account_name: user?.Consumer,
        provider_database_name: user?.providerDBName,
      };
      try {
        const response = await API.getConsumerAdmin(payload);
        if (response.status === 200 && response?.data?.data) {
          setConsumerList(response?.data?.data);
        } else {
          setConsumerList([]);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    getConsumerAdmin();
  }, [user?.Consumer, user?.providerDBName]);

  const renderMonths = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <div className="mt-2 pb-21 flex flex-col">
        <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          required
          className="bg-transparent  block w-1/3 rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
        >
          <option value="">Select Month</option>
          {months.map((month, index) => (
            <option key={index} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderYears = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - (currentYear - 4) + 1 },
      (_, index) => currentYear - index
    );

    return (
      <div className="mt-2 pb-21 flex flex-col">
        <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
          Select Year
        </label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          required
          className="bg-transparent  block w-1/3 rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
        >
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="w-2/3 mx-8">
      <div>
        {user?.role && user?.role?.includes("Provider_Admin") && (
          <div className="mt-2 pb-21 flex flex-col">
            <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
              Select Consumer
            </label>
            <select
              value={selectedConsumer}
              onChange={handleConsumerChange}
              required
              className="bg-transparent  block w-1/3 rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
            >
              <option value="">Select Consumer</option>
              {consumerList?.map((consumer, index) => {
                return (
                  <option key={index} value={consumer.USER}>
                    {consumer.USER}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {renderMonths()}

        {renderYears()}

        {user?.role && user?.role?.includes("Consumer_Admin") && (
          <div className="flex">
            <button
              onClick={handleViewBill}
              className="my-4 flex w-1/3 justify-center rounded-md bg-amaranth-600 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amranth-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-700"
              type="submit"
            >
              View Bill
            </button>
          </div>
        )}

        {user?.role && user?.role?.includes("Provider_Admin") && (
          <div className="flex">
            <button
              onClick={handleViewBillForProducer}
              className="my-4 flex w-1/3 justify-center rounded-md bg-amaranth-600 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amranth-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-700"
              type="submit"
            >
              View Bill
            </button>
          </div>
        )}
        {billError !== null ? (
          <span className="text-[#f44336] text-sm">{billError}</span>
        ) : null}
      </div>
    </div>
  );
};

export default ItemisedBills;
