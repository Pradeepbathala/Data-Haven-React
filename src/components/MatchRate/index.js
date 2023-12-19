import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { Box, Modal } from "@mui/material";
import { Steps } from "intro.js-react";
import { useDispatch, useSelector } from "react-redux";
import Papa from "papaparse";
import { read, utils } from "xlsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LinkedIn } from "@material-ui/icons";

import { handleDate, isObjectEmpty } from "../../utils/commonFunctions";

import * as actions from "../../redux/actions/index";
import Table from "../CommonComponent/Table";
import match from "../../Assets/enrichment.svg";
import email from "../../Assets/Personal data _Monochromatic.svg";
import CommonModal from "../CommonComponent/Modal";
import SampTemp from "../../Assets/CSVTemplates/Sample_template.xlsx";
import "intro.js/introjs.css";
import meta from "../../Assets/META.svg";
// import Linkedin from "../../Assets/Linkedin.png";
import google from "../../Assets/GoogleAd.svg";
import ModalForMetaAds from "./ModalForMetaAds";
import ModalForLinkedIn from "./ModalForLinkedIn";
import MatchAttributes from "./matchAttributes";

import API from "../../apiServices/api";

const baseURL = process.env.REACT_APP_BASE_URL;
const nodeURL = process.env.REACT_APP_NODE_URL;

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

const initialState = {
  Query_Name: "advertiser_match",
  Provider_Name: "",
  Consumer_Name: "",
  Column_Names: "",
  File_Name: "",
  Match_Attribute: {},
  Match_Attribute_Value: {},
  file: "",
  attachment_type: "",
  sf_table_name: "",
};

const MatchRate = () => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();

  const user = state && state.user;
  const TableData =
    state && state.PublisherForm && state.PublisherForm.TableData;
  const requestId =
    state && state.PublisherForm && state.PublisherForm.RequestId;
  const fetchData =
    state && state.PublisherForm && state.PublisherForm.fetchData;
  const SampleFileData =
    state && state.ConsumerForm && state.ConsumerForm.SampleFileData;

  const [formData, setFormData] = useState({
    ...initialState,
    Consumer_Name: user?.Consumer,
  });

  const [byPassAPICalled, setByPassAPICalled] = useState(false);
  const [note, setNote] = useState("");
  const [tableHead, setTableHead] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadSample, setDownloadSample] = useState(false);

  const [snowflakeTableList, setSnowflakeTableList] = useState([]);
  const [matchAttributesList, setMatchAttributesList] = useState([]);
  const [matchAttributesStatus, setMatchAttributesStatus] = useState(false);
  const [identifiersList, setIdentifiersList] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [providerAccountIdentifier, setProviderAccountIdentifier] =
    useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [databaseName, setDatabaseName] = useState("");
  // Create query Modal
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setLoading(false);
    setOpen(false);
    setErrorMessage("");
    setFormData({
      ...formData,
      Match_Attribute: "",
      Match_Attribute_Value: "",
    });
  };

  const [requestFailedReason, setRequestFailedReason] = React.useState({
    openModal: false,
    message: "",
  });

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

  const [showMetaAds, setShowMetaAds] = useState({
    openModal: false,
    data: {
      runId: "",
      template_name: "",
      IDENTIFIER_TYPE:"",
      campaign: [],
    },
  });
  const [showLinkedInAds, setShowLinkedInAds] = useState({
    openModal: false,
    data: {
      runId: "",
      template_name: "",
      IDENTIFIER_TYPE:"",
      campaign: [],
    },
  });

  const [data, setData] = useState([]);

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
          setFormData({ ...formData, Provider_Name: provider_name?.PROVIDER });
          getDatabaseName(provider_name.PROVIDER);

          try {
            const payload = {
              account_name: user?.Consumer,
              db_name: user?.consumerDBName,
              provider_name: provider_name?.PROVIDER,
            };

            const response = await API.getProviderAccount(payload);
            if (
              response.status === 200 &&
              response?.data?.data?.length > 0 &&
              response?.data?.data[0]?.PROV_ACCT_IDENTIFIER
            ) {
              let provider_account_identifier =
                response?.data?.data[0]?.PROV_ACCT_IDENTIFIER;
              setProviderAccountIdentifier(
                `DCR_${provider_account_identifier}_PROVIDER_DB`
              );
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getAllProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

  // get Identifier Types

  useEffect(() => {
    if (formData?.Provider_Name !== "" && open) {
      const getIdentifierTypes = async () => {
        const payload = {
          account_name: formData?.Provider_Name,
          provider_name: formData?.Provider_Name,
          consumer_name: user?.Consumer,
          db_name: providerAccountIdentifier,
        };
        try {
          const response = await API.getIdentifierTypes(payload);
          if (response.status === 200 && response?.data?.data) {
            setIdentifiersList(
              response?.data?.data?.[0]?.IDENTIFIER_TYPE?.split(",")
            );
          } else {
            setIdentifiersList([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      getIdentifierTypes();
    }
  }, [
    user.name,
    user?.Consumer,
    formData?.Provider_Name,
    providerAccountIdentifier,
    open,
  ]);

  // get Match Attributes

  useEffect(() => {
    if (formData?.Provider_Name !== "" && open) {
      const getMatchAttributes = async () => {
        const payload = {
          account_name: formData?.Provider_Name,
          provider_name: formData?.Provider_Name,
          consumer_name: user?.Consumer,
          db_name: providerAccountIdentifier,
        };
        try {
          const response = await API.getMatchAttributes(payload);
          if (response.status === 200 && response?.data?.data) {
            setMatchAttributesList(response?.data?.data);
          } else {
            setMatchAttributesList([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      getMatchAttributes();
    }
  }, [
    user.name,
    user?.Consumer,
    formData?.Provider_Name,
    providerAccountIdentifier,
    open,
  ]);

  // get Match Attributes status

  useEffect(() => {
    if (formData?.Provider_Name !== "" && open) {
      const getMatchAttributesStatus = async () => {
        const payload = {
          account_name: formData?.Provider_Name,
          provider_name: formData?.Provider_Name,
          consumer_name: user?.Consumer,
          db_name: providerAccountIdentifier,
        };
        try {
          const response = await API.getMatchAttributesStatus(payload);
          if (response.status === 200 && response?.data?.data) {
            if (response?.data?.data[0]?.COUNT === 1) {
              setMatchAttributesStatus(true);
            } else {
              setMatchAttributesStatus(false);
            }
          } else {
            setMatchAttributesStatus(true);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      getMatchAttributesStatus();
    }
  }, [
    user.name,
    user?.Consumer,
    formData?.Provider_Name,
    providerAccountIdentifier,
    open,
  ]);
// useEffect for sf_table
  useEffect(() => {
    if (formData?.attachment_type === "sf_table") {
      const getSnowflakeTable = async () => {
        const payload = {
          account_name: user?.Consumer,
          db_name: user?.consumerDBName,
        };
        try {
          const response = await API.getSnowflakeTables(payload);
          if (response.status === 200 && response?.data?.data) {
            let result = response?.data?.data?.map((item) => {
              return item.TABLE_NAME;
            });
            setSnowflakeTableList(result);
          } else {
            setSnowflakeTableList([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      getSnowflakeTable();
    }
  }, [user?.consumerDBName, user?.Consumer, formData?.attachment_type]);

  // createNewRequest function
    const createNewRequest = async () => {
    if (formData.Consumer_Name !== "" && formData.Query_Name !== "") {
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
        template_name: "ADVERTISER MATCH",
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
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    
    fetchMainTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMainTable = async () => {
    const payload = {
      account_name: user?.Consumer,
      db_name: user?.consumerDBName,
      template_name: "ADVERTISER MATCH",
    };
    try {
      const response = await API.fetchData(payload);
      if (response.status === 200 && response?.data?.data) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
    if (TableData) {
      setTableHead(TableData?.head || []);
      setTableRows(TableData?.rows || []);
    }
  }, [TableData]);

  const handleCustomerFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileInput = (event) => {
    event.preventDefault();
    setFileErrorMessage("");
    var fileInput = document.getElementById("myFileInput");
    var file = fileInput?.files[0];
    setFormData({ ...formData, file: file });
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension === "csv") {
        // Handle CSV file
        Papa.parse(file, {
          complete: function (results) {
            const jsonData = results?.data;
            // Assuming the first row contains the column names
            const headers = jsonData[0];

            if (jsonData?.length > 1) {
              if (headers?.length > 1) {
                setFileErrorMessage(
                  "Columns are added more than one in the CSV file"
                );
              } else if (headers?.length < 1) {
                setFileErrorMessage("Please add one Column in the CSV file");
              } else if (headers?.length === 1) {
                if (
                  headers[0]?.toUpperCase() === "EMAIL" ||
                  headers[0]?.toUpperCase() === "PHONE" ||
                  headers[0]?.toUpperCase() === "MAID-WIP"
                ) {
                  setFileErrorMessage("");
                } else {
                  setFileErrorMessage("Invalid CSV file. Upload not allowed.");
                }
              } else {
                setFileErrorMessage("Invalid CSV file. Upload not allowed.");
              }
            } else {
              setFileErrorMessage("Invalid CSV file. No Data present.");
            }
          },
        });
      } else if (fileExtension === "xlsx") {
        // Handle XLSX file
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result;
          const workbook = read(arrayBuffer, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

          // Assuming the first row contains the column names
          const headers = jsonData[0];
          if (jsonData?.length > 1) {
            if (headers?.length > 1) {
              setFileErrorMessage(
                "Columns are added more than one in the XLSX file"
              );
            } else if (headers?.length < 1) {
              setFileErrorMessage("Please add one Column in the XLSX file");
            } else if (headers?.length === 1) {
              if (
                headers[0]?.toUpperCase() === "EMAIL" ||
                headers[0]?.toUpperCase() === "PHONE" ||
                headers[0]?.toUpperCase() === "MAID-WIP"
              ) {
                setFileErrorMessage("");
              } else {
                setFileErrorMessage("Invalid XLSX file. Upload not allowed.");
              }
            } else {
              setFileErrorMessage("Invalid XLSX file. Upload not allowed.");
            }
          } else {
            setFileErrorMessage("Invalid XLSX file. No Data present.");
          }
        };

        reader.readAsArrayBuffer(file);
      } else {
        setFileErrorMessage(
          "Invalid file type. Only CSV and XLSX files are allowed."
        );
      }
    }
  };

  // const isValidInput = (inputString) => {
  //   const regex = /^[0-9][0-9,-]*[0-9]$/; // regex pattern to match only comma, hyphen, and numeric values and start and end with numeric values
  //   return regex.test(inputString); // returns true if inputString matches the regex pattern, false otherwise
  // };

  const callByPassAPI = async (newReqId, providerAccIdentifier) => {
    setByPassAPICalled(true);
    // fetchMainTable();
    handleClose();

    const payload = {
      account_name: user?.Consumer,
      db_name: user?.consumerDBName,
      provider_account_identifier: providerAccIdentifier,
      newReqId: newReqId,
      template_name: "ADVERTISER MATCH",
    };
    try {
      const response = await API.callProcedureMatchRate(payload);
      if (response.status === 200) {
        setByPassAPICalled(false);
        fetchMainTable();

        try {
          await API.callProcedureAnalytics(payload);
          // if (response.status === 200) {
          //   fetchMainTable();
          //   setUploading(false);
          // }
        } catch (error) {
          console.log(error);
        }
      } else {
        setByPassAPICalled(false);
        fetchMainTable();
        dispatch(
          actions.PublisherForm({
            fetchData: false,
          })
        );
      }
    } catch (error) {
      console.log(error);
      setByPassAPICalled(false);
      fetchMainTable();
    }
  };

  const insertDataIntoTable = async (filename) => {
    try {
      const payload = {
        account_name: user?.Consumer,
        template_name: formData?.Query_Name,
        provider_name: formData?.Provider_Name,
        columns: formData?.Column_Names,
        consumer_name: formData?.Consumer_Name,
        run_id: formData?.RunId,
        file_name: filename,
        attribute_name: matchAttributesStatus
          ? JSON.stringify(formData?.Match_Attribute)
          : null,
        // attribute_value: formData?.Match_Attribute_Value,
        consumer_database_name: user?.consumerDBName,
        tag: formData?.attachment_type,
        provider_account_identifier: providerAccountIdentifier,
      };
     console.log("tag value : " , formData?.attachment_type);
      const response = await API.insertMatchRateRequest(payload);
      if (response.status === 200) {
        try {
          const payload = {
            account_name: formData?.Provider_Name,
            // db_name: user?.providerDBName,
            db_name: `DCR_${providerAccountIdentifier}_PROVIDER_DB`,
            run_id: formData.RunId,
          };

          const response = await API.insertRunId(payload);
          if (response.status === 200) {
            dispatch(
              actions.PublisherForm({
                RequestId: formData?.RunId,
                fetchData: true,
              })
            );
            callByPassAPI(formData.RunId, providerAccountIdentifier);
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);

          console.error("Error fetching data:", error);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (matchAttributesStatus && isObjectEmpty(formData?.Match_Attribute)) {
      toast.error("Please select Match Attribute");
      return;
    }
    formData.RunId = Date.now();
    setLoading(true);
    setErrorMessage("");

    if (formData?.attachment_type === "attachment") {
      if (downloadSample || fileErrorMessage !== "") {
        setDownloadSample(false);
        return;
      }
      // Upload file in Local uploadedFiles folder..
      const fileName = `${
        formData.RunId + "." + formData?.file?.name?.split(".")[1]
      }`;
      const modifiedFile = new File([formData?.file], fileName, {
        type: formData?.file.type,
      });
      formData.File_Name = fileName;
      formData.file = modifiedFile;
      const localFile = new FormData();

      localFile.append("myFile", modifiedFile);

      axios
        .post(`${nodeURL}/api/localFileUpload`, localFile, {
          headers: {
            "content-type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then(async (response) => {
          if (parseInt(response?.status) === 200) {
            const payload = {
              account_name: user?.Consumer,
              filename: fileName,
              identifyer: formData?.Column_Names.toUpperCase(),
              db_name: user?.consumerDBName,
            };
            try {
              const response = await API.attachment(payload);
              if (
                parseInt(response?.status) === 200 &&
                response?.data?.data === true
              ) {
                fetchMainTable();
                insertDataIntoTable(fileName);
              } else {
                fetchMainTable();
                setLoading(false);
                setErrorMessage(
                  "The data is not matching with requested Identifier."
                );
              }
            } catch (error) {
              setLoading(false);

              console.error("Error fetching data:", error);
            }
          } else {
            setLoading(false);
            setErrorMessage("Something went wrong, please try again later !!!");
          }
        })
        .catch((error) => {
          setLoading(false);
          setErrorMessage("Something went wrong, please try again later !!!");
          console.error("Error fetching data:", error);
        });
    } else {
      insertDataIntoTable(formData?.sf_table_name);
    }
  };

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
      actions.PublisherForm({
        TableData: { head: head, rows: row, runId: runId },
        CardData: data,
        fetchData: false,
      })
    );
  };

  const fetchcsvTableData = async (templateName, runId) => {
    templateName = templateName.replace(/\s/g, "_");

    const payload = {
      account_name: user?.Consumer,
      templateName: templateName,
      run_id: runId,
      consumer_database_name: user?.consumerDBName,
    };
    try {
      const response = await API.viewRequestDataMatchRate(payload);

      if (response.status === 200 && response?.data?.data) {
        fetchTable(response?.data?.data, runId);
        handleResultModalOpen();
      }
    } catch (error) {
      console.log("In API catch", error);
    }
  };

  const callByPassUpload = () => {
    setTimeout(async () => {
      fetchMainTable();
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
      };
      try {
        const response = await API.callMatchedDataProcedure(payload);
        if (response.status === 200) {
          setUploading(false);
          setTimeout(() => {fetchMainTable(); }, 2000);
        }
      } catch (error) {
        console.log(error);
        fetchMainTable();
        setUploading(false);
      }
    }, 2000);
  };

  const handleUploadData = async (runId) => {
    setUploading(true);
    const payload = {
      account_name: user?.Consumer,
      db_name: user?.consumerDBName,
      run_id: runId,
    };
    try {
      const response = await API.queryRequests(payload);
      if (response.status === 200 && response?.data?.data) {
        let data = response?.data?.data?.[0];
        console.log("Data:",data);
        const payload = {
          account_name: user?.Consumer,
          template_name: formData?.Query_Name,
          provider_name: formData?.Provider_Name,
          columns: data?.COLUMNS,
          consumer_name: formData?.Consumer_Name,
          run_id: runId,
          file_name: data?.FILE_NAME,
          attribute_name: data?.ATTRIBUTE_NAME,
          attribute_value: data?.ATTRIBUTE_VALUE,
          consumer_database_name: user?.consumerDBName,
          //tag: formData.attachment_type,
          tag: data.TAG,
        };
        try {
         const response = await API.insert_requestUplToClientSpace(payload);
          if (response.status === 200) {
            const payload = {
              account_name: user?.Consumer,
              db_name: user?.consumerDBName,
              run_id: runId,
            };
            try {
              const response = await API.updateDashboardTableStatus(payload);
              if (response.status === 200) {
                fetchMainTable();
                callByPassUpload();
              }
            } catch (error) {
              console.log(error);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const downloadNewFile = () => {
    const link = document.createElement("a");
    link.href = SampTemp;
    link.download = "Sample_Template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // toast.success(`Sample Template has been downloaded...`);
  };

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

  /// View the sample data...
  const handleViewSample = async () => {
    if (
      SampleFileData &&
      SampleFileData !== "undefined"
      && !isObjectEmpty(SampleFileData)
    ) {
      setOpenSampleData(true);
    } else {
      const payload = {
        account_name: user?.Consumer,
        db_name: databaseName,
      };
      try {
        // select * from DCR_PROVIDER2.CLEANROOM.CUSTOMERS_SAMPLE_VW;
        const response = await API.enrichmentCustomerSampleView(payload);

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

  // React Intro JS
  const modalRef = useRef();

  const [stepsEnabled, setStepsEnabled] = useState(true);

  const steps = [
    {
      element: "#matchRate",
      intro: "Welcome to Match Rate page.",
    },
    {
      element: "#viewSample",
      intro: "View sample data to have an understanding on the providers data",
    },
    {
      element: "#createNewRequestMatchRate",
      intro: "Click here to create a new request.",
    },
    {
      element: "#modal_mr",
      intro:
        "Select the columns for match rate. You can multiselect. Select Identifier type to do the match. Submit the request.",
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
    return true;
  };

  const sendEmail = () => {
    setEmailLoading(true);
    axios
      .get(`${baseURL}/mailtoadmin`, {
        params: {
          subject: `${user?.name} wants to explore`,
          message: `Hello,
                        ${user?.name} wants to explore more features of Data Haven. Please connect with ${user?.name} as soon as possible.`,
        },
      })
      .then((response) => {
        if (response) {
          setNote("** Our Expert team will connect with you, very soon. **");
          setEmailLoading(false);
        } else {
          setNote("");
          setEmailLoading(false);
        }
      })
      .catch((error) => console.log(error));
  };

  const showAnalyticsPage = (runId) => {
    dispatch(
      actions.AnalyticsData({
        RequestId: runId,
      })
    );
    navigate("/analytics");
  };

  const handleClickMetaAds = (runId, template_name,IDENTIFIER_TYPE) => {
    const templateName = template_name.replace(/ /g, "_");
    setShowMetaAds({
      ...showMetaAds,
      openModal: true,
      data: {
        runId: runId,
        template_name: templateName,
        IDENTIFIER_TYPE:IDENTIFIER_TYPE,
      },
    });
  };

  const handleClickLinkedInAds = (runId, template_name,IDENTIFIER_TYPE) => {
    const templateName = template_name.replace(/ /g, "_");
    setShowLinkedInAds({
      ...showLinkedInAds,
      openModal: true,
      data: {
        runId: runId,
        template_name: templateName,
        IDENTIFIER_TYPE:IDENTIFIER_TYPE,
      },
    });
  };

  return (
    <>
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        options={{ hideNext: false, dontShowAgain: true }}
        initialStep={0}
        onExit={onExit}
        ref={stepsRef}
        onBeforeChange={onBeforeChange}
      />
      <div id="mr_container" className="flex flex-col  w-full h-full">
        <div className="flex h-12 sticky top-0 px-5  py-2 bg-amaranth-800 flex-row items-center justify-between w-full">
          <h3 id="matchRate" className="text-lg font-light text-white">
            Match rate
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
        <div className="relative flex flex-col px-6 py-8   bg-amaranth-50">
          <div className="flex w-2/3 text-gray-500 ">
            <p>
              Find the Match rate between your's and Provider's data based on a
              data point(Email/Phone No. etc.,) to run an AD campaign on
              provider's Ecospace. Select additional Match Atrribute to get more
              insights on your matched data.
            </p>
          </div>
          <div className="flex flex-grow-0 mt-4">
            <button
              id="createNewRequestMatchRate"
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
            className="absolute w-44 z-0 bottom-2  right-2 text-amarant-400"
            src={match}
            alt=""
          />
        </div>
        <div className="flex flex-col w-full px-5">
          <h1 className=" mt-4 text-xl font-regular text-amaranth-600 pb-2 ">
            Recent requests
          </h1>

          <table className="table-auto w-full text-center text-sm">
            <thead>
              <tr className="bg-amaranth-50 text-amaranth-900 uppercase text-sm leading-normal border-t border-l ">
                <th className="px-4 py-2 border-r"></th>
                <th className="px-4 py-2 border-r">Status</th>
                <th className="px-4 py-2 border-r">Request ID</th>
                <th className="px-4 py-2 border-r">Identifier Type</th>
                <th className="px-4 py-2 border-r">Match Attribute</th>
                <th className="px-4 py-2 border-r">Match count</th>
                <th className="px-4 py-2 border-r">Actions</th>
                <th className="px-4 py-2 border-r">Requested</th>
              </tr>
            </thead>
            <tbody className="text-amaranth-950 text-sm font-light">
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="text-amaranth-950 border-b border-gray-200 hover:bg-amaranth-50"
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
                  <td className="border px-4 py-2">{item.IDENTIFIER_TYPE}</td>
                  <td className="border px-4 py-2">{item.ATTRIBUTE}</td>
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
                      {user.role &&
                      user?.role?.includes("Publisher") &&
                      user?.role?.includes("Consumer") ? (
                        <>
                          {
                          item.UPL_INTO_CLI_SPACE?.toLowerCase() ===
                            "in progress" ? (
                            <div>
                              <CircularProgress
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  color: "amaranth-600",
                                }}
                                title="Wait uploading is going on"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUploadData(item.RUN_ID)}
                              disabled={
                                item.UPL_INTO_CLI_SPACE?.toLowerCase() ===
                                  "true" &&
                                item.STATUS?.toLowerCase() === "completed"
                              }
                              className={`${
                                item.UPL_INTO_CLI_SPACE?.toLowerCase() !==
                                  "true" &&
                                item.STATUS?.toLowerCase() === "completed"
                                  ? "opacity-1 hover:text-inherit"
                                  : "disabled opacity-25 hover:text-inherit"
                              }  px-2 hover:text-amaranth-600`}
                              title={
                                item.UPL_INTO_CLI_SPACE?.toLowerCase() ===
                                "true"
                                  ? "Already Uploaded into client ecospace"
                                  : "Upload match records into client ecospace"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                class="w-5 h-5 text-amaranth-600"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.03 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v4.94a.75.75 0 001.5 0v-4.94l1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => showAnalyticsPage(item.RUN_ID)}
                            disabled={item.STATUS.toLowerCase() !== "completed"}
                            className={`${
                              item.STATUS.toLowerCase() === "completed"
                                ? "opacity-1 hover:text-inherit"
                                : "disabled opacity-25 hover:text-inherit"
                            }  px-2 hover:text-amaranth-600`}
                            title="Show Analytics"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="w-5 h-5 text-amaranth-600"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
                                clip-rule="evenodd"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              handleClickMetaAds(
                                item.RUN_ID,
                                item.TEMPLATE_NAME,
                                item.IDENTIFIER_TYPE
                              )
                            }
                            disabled={item.STATUS.toLowerCase() !== "completed"}
                            className={`${
                              item.STATUS.toLowerCase() === "completed"
                                ? "opacity-1 hover:text-inherit"
                                : "disabled opacity-25 hover:text-inherit"
                            }  px-2 hover:text-amaranth-600 w-8`}
                            title="Run Ad campaign on Meta ADs"
                          >
                            <img src={meta} alt="" />
                          </button>
                          <button
                            // onClick={() => googleAd(item.RUN_ID)}
                            disabled={item.STATUS.toLowerCase() !== "completed"}
                            className={`${
                              item.STATUS.toLowerCase() === "completed"
                                ? "opacity-1 hover:text-inherit"
                                : "disabled opacity-25 hover:text-inherit"
                            }  px-2 hover:text-amaranth-600 w-8`}
                            title="Run Ad campaign on Google ADs"
                          >
                            <img src={google} alt="" />
                          </button>
                          {/* LinkedInButton Added */}
                          <button
                            onClick={() =>
                              handleClickLinkedInAds(
                                item.RUN_ID,
                                item.TEMPLATE_NAME,
                                item.IDENTIFIER_TYPE
                              )
                            }
                            disabled={item.STATUS.toLowerCase() !== "completed"}
                            className={`${
                              item.STATUS.toLowerCase() === "completed"
                                ? "opacity-1 hover:text-inherit"
                                : "disabled opacity-25 hover:text-inherit"
                            }  px-2 hover:text-amaranth-600 w-8`}
                            title="Run Ad campaign on LinkedIn ADs"
                          >
                            <LinkedIn className="text-amaranth-600" />
                            {/* <img src={Linkedin} alt="" /> */}
                          </button>
                        </>
                      ) : null}
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
        {user.role &&
          user?.role?.includes("Publisher") &&
          !user?.role?.includes("Consumer") && (
            <div className="relative flex flex-col mt-6 px-6 py-8   bg-amaranth-50">
              <div className="flex w-2/3 text-gray-500 ">
                <p>
                  Want to Explore more features of Datahaven & integrate with
                  the provider.
                </p>
              </div>
              <div className="flex flex-grow-0 mt-4">
                {emailLoading ? (
                  <CircularProgress
                    style={{
                      width: "24px",
                      height: "24px",
                      color: "amaranth-600",
                    }}
                  />
                ) : (
                  <button
                    className="w-max flex items-center px-2 py-2  text-sm text-white bg-amaranth-600 rounded-md   hover:bg-amaranth-700"
                    onClick={() => sendEmail()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6 mr-2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    Click Here
                  </button>
                )}
              </div>

              <img
                className="absolute w-44 z-0 bottom-2  right-2 text-amarant-400"
                src={email}
                alt=""
              />
              <div className="w-full max-w-full px-3 py-3sm:flex-0 shrink-0 sm:w-6/12 lg:w-full">
                {note !== "" ? (
                  <span className="text-amaranth-950 text-sm">{note}</span>
                ) : (
                  ""
                )}
              </div>
            </div>
          )}
        <Modal
          ref={modalRef}
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          id="modal_mr"
          container={() => document.getElementById("mr_container")}
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
                    New Match Rate request
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
                <div className="mt-2 pb-21 flex flex-col">
                  <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
                    Attachment type
                  </label>
                  <select
                    name="attachment_type"
                    onChange={handleCustomerFormData}
                    required
                    // value={formData.attachment_type}
                    className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
                  >
                    <option value="">Please select</option>
                    <option value="attachment">Attachment</option>
                    <option value="sf_table">SF Table</option>
                  </select>
                </div>

                {formData.attachment_type === "attachment" ? (
                  <>
                    <div className="mt-2 flex flex-col">
                      <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
                        Upload File
                      </label>
                      <input
                        // className="my-2 flex w-full justify-center rounded-md bg-amaranth-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amranth-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-700"
                        className=""
                        type="file"
                        id="myFileInput"
                        onChange={handleFileInput}
                        required
                      />
                    </div>
                    <div className="flex pt-2">
                      {fileErrorMessage !== "" && (
                        <span className="text-red-600">{fileErrorMessage}</span>
                      )}
                    </div>
                    <div className="mt-2 pb-21 flex flex-col">
                      <button
                        className="flex flex-row text-amaranth-600"
                        onClick={() => {
                          downloadNewFile();
                          setDownloadSample(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="pl-2 underline">
                          Download Template
                        </span>
                      </button>
                    </div>
                  </>
                ) : formData.attachment_type === "sf_table"? (
                  <div className="mt-2 pb-21 flex flex-col">
                    <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
                      Snowflake Table
                    </label>
                    <select
                      name="sf_table_name"
                      onChange={handleCustomerFormData}
                      required
                      // value={formData.sf_table_name}
                      className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
                    >
                      <option value="">Please select</option>
                      {snowflakeTableList?.map((table_name, index) => {
                        return (
                          <option key={index} value={table_name}>
                            {table_name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ):(<></>)}

                <div className="mt-2 pb-21 flex flex-col">
                  <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
                    Identifier Type
                  </label>
                  <select
                    name="Column_Names"
                    onChange={handleCustomerFormData}
                    required
                    className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
                  >
                    <option value="">Please select</option>
                    {identifiersList.length > 0 &&
                      identifiersList?.map((item, idx) => {
                        return (
                          <option key={idx} value={item?.toLowerCase()}>
                            {item}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {matchAttributesStatus && (
                  <div className="mt-2 pb-21 flex flex-col">
                    <MatchAttributes
                      formData={formData}
                      setFormData={setFormData}
                      matchAttributesList={matchAttributesList}
                    />
                  </div>
                )}

                {/* <div className="mt-2 pb-21 flex flex-col">
                  <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
                    Match Attribute
                  </label>
                  <select
                    name="Match_Attribute"
                    onChange={handleCustomerFormData}
                    required
                    className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
                  >
                    <option value="">Please select</option>
                    <option value="overall">Overall</option>
                    <option value="age">Age</option>
                    <option value="gender">Gender</option>
                  </select>
                  {formData["Match_Attribute"] === "gender" && (
                    <div className="mt-2 pb-21 flex flex-col">
                      <span className="block text-sm font-medium leading-6 text-amaranth-600 ">
                        Select Gender
                      </span>
                      <label>
                        <input
                          type="radio"
                          value="male"
                          checked={gender === "male"}
                          onChange={(e) => setGender(e.target.value)}
                        />
                        <span className="pl-2">Male</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="female"
                          checked={gender === "female"}
                          onChange={(e) => setGender(e.target.value)}
                        />
                        <span className="pl-2">Female</span>
                      </label>
                    </div>
                  )}
                  {formData["Match_Attribute"] === "age" && (
                    <div className="mt-2 pb-21 flex flex-col">
                      <span className="block text-sm font-medium leading-6 text-amaranth-600 ">
                        Select Age
                      </span>
                      <label>
                        <input
                          type="radio"
                          value="age_0_6"
                          checked={age === "age_0_6"}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <span className="pl-2">0-6</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="age_7_16"
                          checked={age === "age_7_16"}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <span className="pl-2">7-16</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="age_17_25"
                          checked={age === "age_17_25"}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <span className="pl-2">17-25</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="age_26_40"
                          checked={age === "age_26_40"}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <span className="pl-2">26-40</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="age_41_above"
                          checked={age === "age_41_above"}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <span className="pl-2">41-above</span>
                      </label>
                    </div>
                  )}
                </div> */}
                <div className="flex justify-end">
                  {loading ? (
                    <div className="my-2 flex w-full justify-center rounded-md bg-amaranth-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amranth-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-700">
                      <CircularProgress
                        style={{
                          width: "24px",
                          height: "24px",
                          color: "#FFFFFF",
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      className="my-2 flex w-full justify-center rounded-md bg-amaranth-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amranth-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-700"
                      type="submit"
                    >
                      Submit query
                    </button>
                  )}
                </div>
                <div className="flex justify-center pt-2">
                  {errorMessage !== "" ? (
                    <span className="text-red-600">{errorMessage}</span>
                  ) : (
                    loading && (
                      <span className="text-red-600">
                        Uploading the Attachment. Please wait
                      </span>
                    )
                  )}
                </div>
              </div>
            </form>
          </Box>
        </Modal>

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
                    <>
                      <Table
                        id={TableData?.runId}
                        head={tableHead}
                        rows={tableRows}
                        pagination={"none"}
                      />
                    </>
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

        {/* Show Meta ad's modal */}
        {showMetaAds.openModal ? (
          <ModalForMetaAds
            open={showMetaAds.openModal}
            handleClose={() =>
              setShowMetaAds({
                ...showMetaAds,
                openModal: false,
                runId: "",
                template_name: "",
                IDENTIFIER_TYPE:"",
              })
            }
            data={showMetaAds.data}
          />
        ) : null}

        {/* Show LinkedIn ad's modal */}
        {showLinkedInAds.openModal ? (
          <ModalForLinkedIn
            open={showLinkedInAds.openModal}
            handleClose={() =>
              setShowLinkedInAds({
                ...showLinkedInAds,
                openModal: false,
                runId: "",
                template_name: "",
                IDENTIFIER_TYPE:"",
              })
            }
            data={showLinkedInAds.data}
          />
        ) : null}
      </div>
    </>
  );
};

export default MatchRate;
