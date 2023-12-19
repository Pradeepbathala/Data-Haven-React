import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

import CommonModal from "../../CommonComponent/Modal";
import API from "../../../apiServices/api";

const AllowedColumns = ({ user }) => {
  const [publisherData, setPublisherData] = useState({
    consumer: "",
    template: "",
    column_name: "",
    status: "",
  });

  const [consumers, setConsumers] = useState([]);
  const [templateNames, setTemplateNames] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [allowedColumns, setAllowedColumns] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(!openModal);
  };

  //   UseEffect for Consumer List....

  useEffect(() => {
    const getConsumerName = async () => {
      const payload = {
        account_name: user.name,
        provider_database_name: user?.providerDBName,
      };
      try {
        const response = await API.getConsumerName(payload);
        if (response?.status === 200 && response?.data?.data) {
          setConsumers(response?.data?.data);
        } else {
          setConsumers([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getConsumerName();
  }, [user.name, user?.providerDBName]);

  //   UseEffect for Template List....

  useEffect(() => {
    const getTemplates = async () => {
      const payload = {
        account_name: user.name,
        provider_database_name: user?.providerDBName,
        user: publisherData?.consumer,
      };
      try {
        const response = await API.getTemplates(payload);
        if (response?.data) {
          setTemplateNames(response?.data?.data);
        } else {
          setTemplateNames([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTemplates();
  }, [user.name, publisherData?.consumer, user?.providerDBName]);

  //   UseEffect for All Columns and Allowed columns list....

  useEffect(() => {
    if (publisherData.consumer !== "" && publisherData.template !== "") {
      const getAllowedColumns = async () => {
        const payload = {
          account_name: user.name,
          provider_database_name: user?.providerDBName,
          user: publisherData?.consumer,
          template_name: publisherData.template,
        };
        try {
          const response = await API.getAllowedColumnsConsole(payload);
          if (response?.status === 200 && response?.data?.data) {
            let data = response?.data?.data;
            let allowed_columns = data[0]?.ALLOWED_COLUMNS?.split("|");
            allowed_columns = allowed_columns?.map((item) => {
              return item?.split(".")[1];
            });
            setAllowedColumns(allowed_columns);
          } else {
            setAllowedColumns([]);
          }
        } catch (error) {
          console.log(error);
        }

        try {
          const response = await API.getAllColumnsConsole(payload);
          if (response?.data?.data) {
            let data = response?.data?.data;
            let all_columns = data[0]?.ALL_COLUMNS?.split(",");
            all_columns = all_columns?.map((item) => {
              return item;
            });
            setAllColumns(all_columns);
          } else {
            setAllColumns([]);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getAllowedColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publisherData.consumer, publisherData.template]);

  useEffect(() => {
    if (
      publisherData.consumer !== "" &&
      publisherData.template !== "" &&
      publisherData.column_name !== ""
    ) {
      const fetchAllowedColumnStatus = async () => {
        const payload = {
          account_name: user.name,
          provider_database_name: user?.providerDBName,
          user: publisherData?.consumer,
          template_name: publisherData.template,
          column_name: publisherData.column_name,
        };
        try {
          const response = await API.fetchAllowedColumnStatus(payload);
          if (response?.data?.data?.length > 0) {
            let data = response?.data?.data;
            setPublisherData({
              ...publisherData,
              status: parseInt(Object.values(data[0])) === 1 ? true : false,
            });
          } else {
            setPublisherData({ ...publisherData, status: "" });
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchAllowedColumnStatus();
    } else {
      setPublisherData({ ...publisherData, status: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    publisherData.consumer,
    publisherData.template,
    publisherData.column_name,
  ]);

  const handleClickYes = async () => {
    setOpenModal(!openModal);
    setLoading(true);
    const payload = {
      account_name: user.name,
      db_name: user?.providerDBName,
      result: JSON.stringify({
        Consumer_Name: publisherData?.consumer,
        Template_Name: publisherData?.template,
        column_name: publisherData?.column_name,
        Tag: publisherData?.status === true ? "remove" : "add",
      }),
    };
    try {
      const response = await API.updateAllowedColumns(payload);
      if (response) {
        callByPass();
      }
    } catch (error) {
      toast.error("Fetching error...");
      console.log(error);
    }
  };

  const handleSubmit = () => {
    if (
      publisherData.consumer === "" ||
      publisherData.template === "" ||
      publisherData.column_name === ""
    ) {
      return;
    } else {
      setMessage(
        `Are you sure, you want to ${
          publisherData.status === true ? "Remove" : "Add"
        } this Column?`
      );
      setOpenModal(!openModal);
    }
  };

  const callByPass = async () => {
    setTimeout(async () => {
      const payload = {
        account_name: user.name,
        provider_database_name: user?.providerDBName,
      };
      try {
        const response = await API.procedureUpdateAllowedColumns(payload);
        setLoading(false);
        setPublisherData({
          consumer: "",
          template: "",
          column_name: "",
          status: "",
        });
        toast.success(response?.data?.data?.[0]?.PROC_NEW_11);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    }, 2000);
  };

  return (
    <div className="w-2/3 mx-8">
      <div className="pt-4 bg-opacity-75 backdrop-filter backdrop-blur-lg ">
        <div className="flex flex-row items-start text-amaranth-500 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mt-1 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-amaranth-900 uppercase">
              CONFIGURE ALLOWED COLUMNS
            </h3>
            <span className="text-sm mb-4 font-light text-amaranth-900">
              {" "}
              Add/Remove Allowed Columns for particular consumer.
            </span>
          </div>
        </div>
      </div>
      <div className="w-1/3">
        <div className="mt-2 pb-21 flex flex-col">
          <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
            Consumer Name
          </label>
          <select
            value={publisherData.consumer}
            onChange={(e) =>
              setPublisherData({
                ...publisherData,
                consumer: e.target.value,
              })
            }
            required
            className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          >
            <option value="">Please select</option>
            {consumers?.map((consumer, index) => (
              <option key={index} value={consumer?.CONSUMER_NAME}>
                {consumer?.CONSUMER_NAME}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 pb-21 flex flex-col">
          <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
            Query Name
          </label>
          <select
            value={publisherData.template}
            onChange={(e) =>
              setPublisherData({
                ...publisherData,
                template: e.target.value,
              })
            }
            required
            className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          >
            <option value="">Please select</option>
            {templateNames?.map((template, index) => (
              <option key={index} value={template?.TEMPLATE_NAME}>
                {template?.TEMPLATE_NAME}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 pb-21 flex flex-col">
          <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
            Column Name
          </label>
          <select
            value={publisherData.column_name}
            onChange={(e) =>
              setPublisherData({
                ...publisherData,
                column_name: e.target.value,
              })
            }
            required
            className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          >
            <option value="">Please select</option>
            {allColumns?.map((column, index) => (
              <option key={index} value={column}>
                {column}
                {"       "}
                {allowedColumns.includes(column) ? "✓" : "✗"}
              </option>
            ))}
          </select>
        </div>

        {publisherData.status !== "" ? (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 bg-amaranth-600 opacity-1 flex items-center py-2 text-sm text-white rounded-md"
            >
              {loading ? (
                <CircularProgress
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#FFFFFF",
                  }}
                />
              ) : (
                <span className="ml-2">{`${
                  publisherData.status === true ? "Remove" : "Add"
                }`}</span>
              )}
            </button>
          </div>
        ) : null}
        <CommonModal
          open={openModal}
          handleClose={handleCloseModal}
          handleClickYes={handleClickYes}
          message={message}
          buttons={true}
        />
      </div>
    </div>
  );
};

export default AllowedColumns;
