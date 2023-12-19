import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Box, CircularProgress, Modal } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import SelectDropdown from "./CommonComponent/SelectDropdown";
import * as actions from "../redux/actions/index";
import enrichment from "../Assets/Personal data _Monochromatic.svg";
import CommonModal from "./CommonComponent/Modal";
import API from "../apiServices/api";

import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import "./introjs-theme.css";

import {
  jsonToCsv,
  handleDate,
  downloadFileInCSV,
  isObjectEmpty,
} from "../utils/commonFunctions";

import Table from "./CommonComponent/Table";

import "./styles.css";
import "./pure-react.css";

// Modal style
const resultstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxHeight: "90%",
  bgcolor: "background.paper",
  overflow: "scroll",
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  p: 2,
  borderRadius: 5,
};

const Enrichment = () => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();

  const user = state && state.user;
  const TableData = state && state.ConsumerForm && state.ConsumerForm.TableData;
  const SampleFileData =
    state && state.ConsumerForm && state.ConsumerForm.SampleFileData;

  const requestId = state && state.ConsumerForm && state.ConsumerForm.RequestId;
  const fetchData = state && state.ConsumerForm && state.ConsumerForm.fetchData;

  const [formData, setFormData] = useState({
    Query_Name: "customer_enrichment",
    Provider_Name: "",
    Column_Names: [],
    Consumer_Name: user?.Consumer,
    Attribute_Value: "",
  });

  const [databaseName, setDatabaseName] = useState("");
  const [columns, setColumns] = useState([]);
  const [byPassAPICalled, setByPassAPICalled] = useState(false);
  const [data, setData] = useState([]);

  const [tableHead, setTableHead] = useState([]);
  const [tableRows, setTableRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error1, setError1] = useState("");
  const [requestFailedReason, setRequestFailedReason] = React.useState({
    openModal: false,
    message: "",
  });

  // Create query Modal
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setLoading(false);
    setOpen(false);
    setFormData({ ...formData, Column_Names: [] });
  };

  // Result Modal
  const [isResultModalOpen, toggleResultModal] = React.useState(false);
  const handleResultModalOpen = () => toggleResultModal(true);
  const handleResultModalClose = () => toggleResultModal(false);

  // Sample Data Modal
  const [sampleData, setOpenSampleData] = useState(false);
  const handleSampleDataClose = () => {
    setOpenSampleData(!sampleData);
  };

  const [disableTemplate, setDisableTemplate] = useState(false);
  const handleCloseDisableTemplate = () => {
    setDisableTemplate(!disableTemplate);
  };

  useEffect(() => {
    if (TableData) {
      setTableHead(TableData?.head || []);
      setTableRows(TableData?.rows || []);
    }
  }, [TableData]);

  // UseEffect used for Calling API for the table if request...

  useEffect(() => {
    let intervalId;
    if (byPassAPICalled === true) {
      intervalId = setInterval(() => {
        fetchMainTable();
      }, 5000);
    }
    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byPassAPICalled]);

  useEffect(() => {
    fetchMainTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMainTable = async () => {
    const payload = {
      account_name: user?.name,
      db_name: user?.consumerDBName,
      template_name: "CUSTOMER ENRICHMENT",
    };
    try {
      const response = await API.fetchData(payload);
      if (response.status === 200 && response?.data?.data) {
        let res = response?.data?.data;
        setData(res);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // UseEffect used for Inserting the Provider...
  useEffect(() => {
    const getAllProviders = async () => {
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
      };
      try {
        const response = await API.getAllProvidersList(payload);
        if (response.status === 200 && response?.data?.data) {
          let provider_name = response?.data?.data?.[0];
          setFormData({ ...formData, Provider_Name: provider_name.PROVIDER });
          getDatabaseName(provider_name.PROVIDER);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getAllProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // UseEffect to call API for get the Columns list

  useEffect(() => {
    if (databaseName !== "" && formData["Query_Name"] !== "") {
      const getAllowedColumns = async () => {
        const payload = {
          account_name: user?.Consumer,
          databaseName: databaseName,
          Query_Name: formData["Query_Name"],
        };
        try {
          const response = await API.getAllowedColumns(payload);
          if (response.status === 200 && response?.data?.data) {
            let col_name = response?.data?.data[0]?.ALLOWED_COLUMNS?.split("|");
            col_name = col_name?.map((item) => {
              return item?.split(".")[1];
            });
            let finalArr = [{ value: "all", name: "All" }];
            let temp = [];
            col_name?.map((value) => {
              return temp.push({ value: value, name: value });
            });
            temp = temp?.sort((a, b) => {
              return a?.name?.localeCompare(b?.name);
            });
            finalArr.push(...temp);
            setColumns(finalArr);
          } else {
            setColumns([]);
            setFormData({
              ...formData,
              Column_Names: [],
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      getAllowedColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseName, formData["Query_Name"], user?.Consumer]);

  /// Get database name for other API's..

  const getDatabaseName = async (selectedProvider) => {
    const payload = {
      account_name: user?.Consumer,
      selectedProvider: selectedProvider,
      consumer_database_name: user?.consumerDBName,
    };
    try {
      const response = await API.getDatabaseName(payload);
      if (response.status === 200 && response?.data?.data) {
        let db_name = response?.data?.data;
        setDatabaseName(db_name[0]?.DATABASE);
      } else {
        setDatabaseName("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createNewRequest = async () => {
    if (formData.Consumer_Name !== "" && formData.Query_Name !== "") {
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
        template_name: formData?.Query_Name,
        consumer_name: user?.Consumer,
      };
      try {
        const response = await API.getTemplateStatus(payload);
        if (
          response.status === 200 &&
          response?.data?.data &&
          response?.data?.data?.length > 0
        ) {
          let status = response?.data?.data[0]?.TEMPLATE_STATUS;
          if (status) {
            setOpen(!open);
          } else {
            setDisableTemplate(!disableTemplate);
          }
        } else {
          setDisableTemplate(!disableTemplate);
        }
      } catch (error) {
        setDisableTemplate(!disableTemplate);
        console.log(error);
      }
    }
  };

  /// View the sample data...

  const handleViewSample = async () => {
    if (
      SampleFileData &&
      SampleFileData !== "undefined" &&
      !isObjectEmpty(SampleFileData)
    ) {
      setOpenSampleData(true);
    } else {
      const payload = {
        account_name: user?.name,
        db_name: databaseName,
      };
      try {
        const response = await API.enrichmentCustomerSampleView(payload);
        // select * from DCR_PROVIDER2.CLEANROOM.CUSTOMERS_SAMPLE_VW;
        if (response.status === 200 && response?.data?.data) {
          let head = [];
          let row = [];
          let data = response?.data?.data;
          if (data?.length > 0) {
            head = data && Object.keys(data[0]);
            data?.map((obj) => {
              return row.push(head?.map((key) => obj[key]));
            });
          }
          setOpenSampleData(true);
          dispatch(
            actions.ConsumerQueryForm({
              SampleFileData: { head: head, rows: row },
            })
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  /// Handle the dropdown data...

  const handleEnrichmentFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /// Handle Multiselct select box...

  const handleChange = (event, name) => {
    const element = "all";
    const index = event?.indexOf(element);

    if (event?.includes("all")) {
      let allSelect = columns?.map((obj) => {
        return obj.value;
      });
      if (index !== -1) {
        allSelect?.splice(index, 1);
      }
      setFormData({
        ...formData,
        [name]: allSelect,
      });
    } else {
      setFormData({
        ...formData,
        [name]: event,
      });
    }
  };

  /// Calling Store procedure...

  const callByPassAPI = () => {
    setByPassAPICalled(true);
    handleClose();

    setTimeout(async () => {
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
      };
      try {
        const response = await API.callProcedureMatchRate(payload);
        if (response.status === 200) {
          setByPassAPICalled(false);
          fetchMainTable();
        } else {
          setByPassAPICalled(false);
          fetchMainTable();
          dispatch(
            actions.ConsumerQueryForm({
              fetchData: false,
            })
          );
        }
      } catch (error) {
        console.log(error);
        setByPassAPICalled(false);
        fetchMainTable();
        dispatch(
          actions.ConsumerQueryForm({
            fetchData: false,
          })
        );
      }
    }, 2000);
  };

  // For Submit the Request...

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError1("");

    // const delimiter = "&";
    // const selectedColumns = `#${formData.Column_Names?.join(delimiter)}#`;
    const selectedColumns = `${formData.Column_Names?.join(",")}`;

    if (byPassAPICalled) {
      toast.error(
        "We are fetching the data for current request. Please wait..."
      );
      return;
    }

    if (!formData.Column_Names || formData.Column_Names.length === 0) {
      setError1("Please select columns from the list.");
      setLoading(false);
      return;
    }

    formData.RunId = Date.now();
    const payload = {
      account_name: user?.Consumer,
      template_name: formData?.Query_Name,
      provider_name: formData?.Provider_Name,
      columns: selectedColumns,
      consumer_name: formData?.Consumer_Name,
      run_id: formData?.RunId,
      attribute_value: formData?.Attribute_Value,
      consumer_database_name: user?.consumerDBName,
    };
    try {
      const response = await API.insertEnrichmentRequest(payload);
      if (response.status === 200) {
        const payload = {
          account_name: formData?.Provider_Name,
          db_name: user?.providerDBName,
          run_id: formData.RunId,
        };
        try {
          const response = await API.insertRunId(payload);
          if (response.status === 200) {
            dispatch(
              actions.ConsumerQueryForm({
                RequestId: formData?.RunId,
                fetchData: true,
              })
            );
            callByPassAPI();
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // For download the file from Table...

  const downloadFile = async (templateName, runId) => {
    templateName = templateName.replace(/\s/g, "_");
    const payload = {
      account_name: user?.name,
      db_name: user?.consumerDBName,
      templateName: templateName,
      run_id: runId,
    };
    try {
      const response = await API.downloadFileAPI(payload);
      if (response.status === 200 && response?.data) {
        const csvData = jsonToCsv(response?.data); // Create a Blob from the CSV data
        downloadFileInCSV(csvData, templateName, runId);
      } else {
        console.log("File cannnot be downloaded...");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // FetchTable function logic and inserting data to the Redux store for table...

  const fetchTable = (data, runId) => {
    let head = [];
    let row = [];
    if (data?.length > 0) {
      head = data && Object.keys(data[0]);
      data?.map((obj) => {
        return row.push(head?.map((key) => obj[key]));
      });
    }
    dispatch(
      actions.ConsumerQueryForm({
        TableData: { head: head, rows: row, runId: runId },
        fetchData: false,
      })
    );
  };

  // fetchcsvTableData function fetching the table data...

  const fetchcsvTableData = async (templateName, runId) => {
    templateName = templateName.replace(/\s/g, "_");
    const payload = {
      account_name: user?.name,
      db_name: user?.consumerDBName,
      templateName: templateName,
      run_id: runId,
    };
    try {
      const response = await API.viewSampleData(payload);
      if (response.status === 200 && response?.data?.data) {
        fetchTable(response?.data?.data, runId);
        handleResultModalOpen();
      }
    } catch (error) {
      console.log("In API catch", error);
    }
  };

  // React Intro JS
  const modalRef = useRef();

  const [stepsEnabled, setStepsEnabled] = useState(true);

  const steps = [
    {
      element: "#customerEnrichment",
      title: "Welcome!",
      intro: "This is the customer enrichment page.",
    },
    {
      element: "#viewSample",
      title: "Step 1",
      intro: "View sample data to have an understanding on the providers data",
    },
    {
      element: "#createNewRequest",
      title: "Step 2",
      intro: "Click here to create a new request.",
    },
    {
      element: "#modal_er",
      title: "Step 3",
      intro:
        "Select the columns for enrichment. You can multiselect. Select Identifier type to do the match. Submit the request.",
      tooltipClass: "customTooltip",
    },
  ];

  const onExit = () => {
    setStepsEnabled(false);
  };

  const stepsRef = useRef();

  const onBeforeChange = (nextStepIndex) => {
    if (nextStepIndex === 2 && !open) {
      setOpen(true);
      stepsRef.current.updateStepElement(nextStepIndex);
    }
  };
  const onAfterChange = (nextStepIndex) => {
    if (nextStepIndex === 3 && !open) {
      setOpen(true);
      stepsRef.current.updateStepElement(nextStepIndex);
    }
  };

  return (
    <>
      <Steps
        enabled={stepsEnabled}
        options={{ hideNext: false, dontShowAgain: true }}
        steps={steps}
        initialStep={0}
        onExit={onExit}
        ref={stepsRef}
        onBeforeChange={onBeforeChange}
        onAfterChange={onAfterChange}
      />
      <div className="flex flex-col w-full h-full ">
        <div className="flex h-12 sticky top-0 z-30 px-5  py-2 bg-amaranth-800 flex-row items-center justify-between w-full">
          <h3
            id="customerEnrichment"
            className=" text-lg font-light text-white"
          >
            Customer Enrichment
          </h3>
          <button
            id="viewSample"
            onClick={handleViewSample}
            className="flex items-center ml-4 px-2 py-2 text-sm text-white bg-amaranth-600 rounded-md hover:bg-amaranth-700  "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
              />
            </svg>
            <span className="ml-2">View sample data</span>
          </button>
        </div>
        <div className="relative flex flex-col px-6 py-8 bg-amaranth-50">
          <div className="flex w-2/3 text-gray-500 ">
            <p>
              Enrich your first hand data with more data points from the
              provider's Data. Make it easier for selecting data points /
              identifier type by exploring sample data from provider's data set.
            </p>
          </div>
          <div className="flex flex-grow-0 mt-4">
            <button
              id="createNewRequest"
              onClick={createNewRequest}
              className=" w-max flex items-center px-2 py-2  text-sm text-white bg-amaranth-600 rounded-md   hover:bg-amaranth-700  "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create new request
            </button>
          </div>
          <img
            className="absolute w-44 z-0 bottom-2  right-2 text-amaranth-400"
            src={enrichment}
            alt=""
          />
        </div>
        <div className="flex flex-col w-full px-5">
          <h1 className=" mt-4 text-xl font-regular text-amaranth-600 pb-2 ">
            Recent Requests
          </h1>
          <table className="table-auto w-full text-center text-sm">
            <thead>
              <tr className="bg-amaranth-50 text-amaranth-900 uppercase text-sm leading-normal border-t border-l ">
                <th className="px-4 py-2 border-r"></th>
                <th className="px-4 py-2 border-r">Status</th>
                <th className="px-4 py-2 border-r">Request ID</th>
                <th className="px-4 py-2 border-r">Column names</th>
                <th className="px-4 py-2 border-r">Identifier Type</th>
                <th className="px-4 py-2 border-r">Match count</th>
                <th className="px-4 py-2 border-r">Actions</th>
                <th className="px-4 py-2 border-r">Requested</th>
              </tr>
            </thead>
            <tbody className="text-amaranth-950 text-sm font-light">
              {data?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-amaranth-50"
                >
                  <td className="border text-amaranth-900 px-4 py-2">
                    <span className="relative flex h-3 w-3 mr-2">
                      {item.STATUS.toLowerCase() === "completed" ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                      ) : item.STATUS.toLowerCase() === "false" ||
                        item.STATUS.toLowerCase() === "failed" ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                      ) : (
                        <>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amaranth-500"></span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="border px-4 py-2  whitespace-nowrap">
                    <span
                      className={`${
                        item.STATUS.toLowerCase() === "completed"
                          ? "bg-green-200 text-green-700"
                          : item.STATUS.toLowerCase() === "failed" ||
                            item.STATUS.toLowerCase() === "false"
                          ? "bg-red-200 text-red-700 "
                          : "bg-amaranth-100 text-amaranth-700 "
                      }   py-1 px-3 rounded-full text-xs`}
                    >
                      {item.STATUS.toLowerCase() === "true"
                        ? "Approved"
                        : item.STATUS.toLowerCase() === "false"
                        ? "Rejected"
                        : item.STATUS}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{item.RUN_ID}</td>
                  <td className="border px-4 py-2">{item.COLOUMNS}</td>
                  <td className="border px-4 py-2">{item.IDENTIFIER_TYPE}</td>
                  <td className="border px-4 py-2">{item.MATCH_COUNT}</td>

                  <td className="border px-4 py-2">
                    <div className="flex justify-between">
                      {item.STATUS.toLowerCase() === "failed" ||
                      item.STATUS.toLowerCase() === "false" ? (
                        <button
                          onClick={() =>
                            setRequestFailedReason({
                              ...requestFailedReason,
                              openModal: true,
                              message: item.ERROR,
                            })
                          }
                          className="opacity-1 px-2 hover:text-inherit"
                          title="Request Error"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-5 h-5 text-red-600"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            fetchcsvTableData(item.TEMPLATE_NAME, item.RUN_ID)
                          }
                          disabled={item.STATUS.toLowerCase() !== "completed"}
                          className={`${
                            item.STATUS.toLowerCase() === "completed"
                              ? "opacity-1 hover:text-inherit"
                              : "disabled opacity-25 hover:text-inherit"
                          }  px-2 hover:text-amaranth-600`}
                          title="View"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-5 h-5 text-amaranth-600"
                          >
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path
                              fill-rule="evenodd"
                              d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          downloadFile(item.TEMPLATE_NAME, item.RUN_ID)
                        }
                        disabled={item.STATUS.toLowerCase() !== "completed"}
                        className={`${
                          item.STATUS.toLowerCase() === "completed"
                            ? "opacity-1 hover:text-inherit"
                            : "disabled opacity-25 hover:text-inherit"
                        }  px-2 hover:text-amaranth-600`}
                        title="Download file"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="w-5 h-5 text-amaranth-600"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <span className="num-2"></span>
                    {handleDate(item.RUN_ID)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* New enrichment request modal */}
        <Modal
          ref={modalRef}
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          id="modal_er"
          container={() => document.getElementById("root")}
        >
          <Box
            sx={style}
            className="bg-white  bg-opacity-75 backdrop-filter backdrop-blur-lg "
          >
            <div className="flex flex-row justify-between items-start ">
              <div className="flex flex-row items-start justify-center text-amaranth-500 ">
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
                  <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br to-amaranth-400 from-amaranth-800 uppercase">
                    New enrichment request
                  </h3>
                  <span className="text-sm mb-4 font-light text-coal">
                    {" "}
                    Please fill in the following details.
                  </span>
                </div>
              </div>
              <button className="mt-1" onClick={handleClose}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              className=" my-1 px-7      "
              name="myForm"
              onSubmit={handleSubmit}
            >
              <div>
                <div className="mt-2 pb-2 flex flex-col">
                  <SelectDropdown
                    title="Columns"
                    mode="multiple"
                    name="Column_Names"
                    value={formData?.Column_Names}
                    placeholder="Select Columns"
                    data={columns}
                    setValue={(e, value) => {
                      handleChange(e, value);
                    }}
                  />
                </div>

                <div className="mt-2 pb-21 flex flex-col">
                  <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
                    Identifier type
                  </label>
                  <select
                    name="Attribute_Value"
                    onChange={handleEnrichmentFormData}
                    required
                    className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
                  >
                    <option value="">Please select</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="MAID">MAID</option>
                  </select>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    className="my-2 flex w-full justify-center rounded-md bg-amaranth-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amranth-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-700"
                    type="submit"
                  >
                    {loading ? (
                      <CircularProgress
                        style={{
                          width: "24px",
                          height: "24px",
                          color: "#FFFFFF",
                        }}
                      />
                    ) : (
                      "Submit Query"
                    )}
                  </button>
                </div>
                <div className="flex justify-center pt-2">
                  {error1 !== "" ? (
                    <span className="text-red-600">{error1}</span>
                  ) : null}
                </div>
              </div>
            </form>
          </Box>
        </Modal>
        {/* Result modal */}
        <Modal
          open={isResultModalOpen}
          onClose={handleResultModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={resultstyle}>
            {!fetchData ? (
              <div className=" flex flex-col flex-grow w-full">
                <div className="flex flex-row items-center justify-between sticky z-30 py-2 px-4 top-0 w-full bg-amaranth-800 text-white">
                  <h3 className="font-bold text-white">Query result</h3>
                  <button onClick={handleResultModalClose}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
                <div className="px-4">
                  {tableHead?.length > 0 && tableRows?.length > 0 ? (
                    <Table
                      id={TableData?.runId}
                      head={tableHead}
                      rows={tableRows}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <span className="text-deep-navy flex flex-grow mt-4">
                We are fetching the data you requested: Request Id -
                <strong>{requestId}</strong>
              </span>
            )}
          </Box>
        </Modal>
        {/* Sample data modal */}
        <Modal
          open={sampleData}
          onClose={handleSampleDataClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={resultstyle}>
            <div className=" flex flex-col flex-grow w-full">
              <div className="flex flex-row items-center justify-between sticky z-30 py-2 px-4 top-0 w-full bg-amaranth-800 text-white">
                <h3 className="font-bold text-white">Sample Data</h3>
                <button onClick={handleSampleDataClose}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
              <div className="px-4">
                {SampleFileData?.head?.length > 0 &&
                SampleFileData?.rows?.length > 0 ? (
                  <Table
                    head={SampleFileData?.head}
                    rows={SampleFileData?.rows}
                  />
                ) : null}
              </div>
            </div>
          </Box>
        </Modal>
        {/* The Template has been disabled for this Consumer Account. Please contact provider. */}
        <Modal
          open={disableTemplate}
          onClose={handleCloseDisableTemplate}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <div className="flex flex-row items-center justify-between sticky z-30 py-2 px-4 top-0 w-full text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>

              <h3 className="font-bold text-red-600 p-4">
                The Template has been disabled for this Consumer Account. Please
                contact provider.
              </h3>
              <button onClick={handleCloseDisableTemplate}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </Box>
        </Modal>

        {requestFailedReason.openModal ? (
          <CommonModal
            open={requestFailedReason.openModal}
            handleClose={() =>
              setRequestFailedReason({
                ...requestFailedReason,
                openModal: false,
              })
            }
            message={requestFailedReason.message}
            buttons={false}
            textColor={"text-red-600"}
          />
        ) : null}
      </div>
    </>
  );
};

export default Enrichment;
