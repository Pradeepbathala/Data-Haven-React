import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import API from "../../../apiServices/api";

import CommonModal from "../../CommonComponent/Modal";

const QueryTemplate = ({ user }) => {
  const [queryData, setQueryData] = useState({
    consumer: "",
    template: "",
    status: "",
  });

  const [consumers, setConsumers] = useState([]);
  const [templateNames, setTemplateNames] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(!openModal);
  };

  useEffect(() => {
    const getConsumerName = async () => {
      const payload = {
        account_name: user.name,
        provider_database_name: user?.providerDBName,
      };
      try {
        const response = await API.getConsumerName(payload);
        if (response.status === 200 && response?.data?.data) {
          setConsumers(response?.data?.data);
        } else {
          setConsumers([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getConsumerName();
  }, [user]);

  useEffect(() => {
    if (queryData?.consumer !== "") {
      const getTemplates = async () => {
        const payload = {
          account_name: user.name,
          provider_database_name: user?.providerDBName,
          user: queryData?.consumer,
        };
        try {
          const response = await API.getTemplates(payload);
          if (response.status === 200 && response?.data?.data) {
            setTemplateNames(response?.data?.data);
          } else {
            setTemplateNames([]);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getTemplates();
    }
  }, [user, queryData.consumer]);

  useEffect(() => {
    if (queryData.consumer !== "" && queryData.template !== "") {
      const fetchTemplateStatus = async () => {
        const payload = {
          account_name: user.name,
          provider_database_name: user?.providerDBName,
          user: queryData?.consumer,
          template_name: queryData?.template,
        };
        try {
          const response = await API.fetchTemplateStatus(payload);
          if (response.status === 200 && response?.data?.data?.length > 0) {
            setQueryData({
              ...queryData,
              status: response?.data?.data[0]?.TEMPLATE_STATUS,
            });
          } else {
            setQueryData({ ...queryData, status: "" });
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchTemplateStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryData.consumer, queryData.template]);

  const handleClickYes = async () => {
    setOpenModal(!openModal);
    setLoading(true);
    const payload = {
      account_name: user.name,
      provider_database_name: user?.providerDBName,
      user: queryData?.consumer,
      template_name: queryData?.template,
      status: queryData?.status === true ? "FALSE" : "TRUE",
    };
    try {
      const response = await API.updateTemplates(payload);
      if (response.status === 200) {
        setLoading(false);
        setQueryData({ consumer: "", template: "", status: "" });
        toast.success(response?.data?.data?.[0]?.UPDATETEMPLATESTATUS);
      } else {
        setLoading(false);
      }
    } catch (error) {
      toast.error("Fetching error...");
      console.log(error);
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (queryData.consumer === "" || queryData.template === "") {
      return;
    } else {
      setMessage(
        `Are you sure, you want to ${
          queryData.status === true ? "Disable" : "Enable"
        } this template?`
      );
      setOpenModal(!openModal);
    }
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
              Configure Query Template
            </h3>
            <span className="text-sm mb-4 font-light text-amaranth-900">
              {" "}
              Enable/Disable Query Template for particular consumer.
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
            value={queryData.consumer}
            onChange={(e) =>
              setQueryData({ ...queryData, consumer: e.target.value })
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
            value={queryData.template}
            onChange={(e) =>
              setQueryData({ ...queryData, template: e.target.value })
            }
            required
            className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          >
            <option value="">Please select</option>
            {templateNames?.map((template, index) => (
              <option key={index} value={template?.TEMPLATE_NAME}>
                {template?.TEMPLATE_NAME}
                {"       "}
                {template?.TEMPLATE_STATUS === true ? " ✓" : "✗"}
              </option>
            ))}
          </select>
        </div>

        {queryData.status !== "" ? (
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
                  queryData.status === true ? "Disable" : "Enable"
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

export default QueryTemplate;
