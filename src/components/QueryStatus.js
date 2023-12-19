import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Modal } from "@mui/material";
import { CircularProgress } from "@mui/material";
import meta from "../Assets/META.svg";
import google from "../Assets/GoogleAd.svg";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { LinkedIn } from "@material-ui/icons";

import API from "../apiServices/api";

import {
  jsonToCsv,
  handleDate,
  downloadFileInCSV,
} from "../utils/commonFunctions";
import * as actions from "../redux/actions/index";
import CustomTable from "./CommonComponent/Table";
import CommonModal from "./CommonComponent/Modal";
import ModalForMetaAds from "./MatchRate/ModalForMetaAds";
import ModalForLinkedIn from "./MatchRate/ModalForLinkedIn";

//const baseURL = process.env.REACT_APP_BASE_URL;

// Modal style
const resultstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxHeight: "90%",
  bgcolor: "background.paper",
  // p: 4,
  // pt:8\,
  overflow: "scroll",
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

const QueryStatus = () => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = state && state.user;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [tableHead, setTableHead] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [requestId, setRequestId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [formData, setFormData] = useState({
    ...initialState,
    Consumer_Name: user?.Consumer,
  });

  const [requestFailedReason, setRequestFailedReason] = React.useState({
    openModal: false,
    message: "",
  });

  // Result Modal
  const [viewTemplate, setViewTemplate] = React.useState({
    openModal: false,
    queryName: "",
  });
  const handleResultModalClose = () =>
    setViewTemplate({
      ...viewTemplate,
      openModal: false,
      queryName: "",
    });

  const [showMetaAds, setShowMetaAds] = useState({
    openModal: false,
    data: {
      runId: "",
      template_name: "",
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

  const fetchMainTable = async () => {
    if (
      user["role"] &&
      user["role"].includes("Publisher") &&
      user["role"].includes("Consumer")
    ) {
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
      };
      try {
        const response = await API.getAllRequestData(payload);
        if (response.status === 200 && response?.data?.data) {
          let data = response?.data?.data;
          setData(data);
          setLoadingTable(false);
        } else {
          setLoadingTable(false);
        }
      } catch (error) {
        setLoadingTable(false);
        console.log(error);
      }
    } else {
      const payload = {
        account_name: user?.Consumer,
        db_name: user?.consumerDBName,
      };
      try {
        const response = await API.getAllRequestData(payload);
        if (response.status === 200 && response?.data?.data) {
          let data = response?.data?.data;
          setData(data);
          setLoadingTable(false);
        } else {
          setLoadingTable(false);
        }
      } catch (error) {
        console.log(error);
        setLoadingTable(false);
      }
    }
  };

  useEffect(() => {
    setLoadingTable(true);
    fetchMainTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadFile = async (TEMPLATE_NAME, RUN_ID) => {
    const template_name = TEMPLATE_NAME?.replace(/\s/g, "_");
    const payload = {
      account_name: user?.Consumer,
      db_name: user?.consumerDBName,
      templateName: template_name,
      run_id: RUN_ID,
    };
    try {
      const response = await API.downloadFileAPI(payload);
      if (response.status === 200 && response?.data) {
        const csvData = jsonToCsv(response?.data); // Create a Blob from the CSV data
        downloadFileInCSV(csvData, TEMPLATE_NAME, RUN_ID);
      } else {
        console.log("File cannnot be downloaded...");
      }
    } catch (error) {
      console.error("Error:", error);
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
    setTableHead(head);
    setTableRows(row);
    setRequestId(runId);
  };

  const fetchcsvTableData = async (templateName, runId) => {
    const template_name = templateName.replace(/\s/g, "_");
    const payload = {
      account_name: user?.Consumer,
      db_name: user?.consumerDBName,
      templateName: template_name,
      run_id: runId,
    };
    try {
      const response = await API.viewSampleData(payload);

      if (response.status === 200 && response?.data?.data) {
        fetchTable(response?.data?.data, runId);
        setViewTemplate({
          ...viewTemplate,
          openModal: true,
          queryName: templateName,
        });
      }
    } catch (error) {
      console.log("In API catch", error);
    }
  };

  const showAnalyticsPage = (runId) => {
    dispatch(
      actions.AnalyticsData({
        RequestId: runId,
      })
    );
    navigate("/analytics");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          provider_name: data.PROVIDER_NAME,
          columns: data?.COLUMNS,
          consumer_name: formData?.Consumer_Name,
          run_id: runId,
          file_name: data?.FILE_NAME,
          attribute_name: data?.ATTRIBUTE_NAME,
          attribute_value: data?.ATTRIBUTE_VALUE,
          consumer_database_name: user?.consumerDBName,
         // tag: formData?.attachment_type,
          tag: data.TAG,
        };
        try {
         console.log("attachment :",formData?.attachment_type);

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
          fetchMainTable();
          setUploading(false);
        }
      } catch (error) {
        console.log(error);
        fetchMainTable();
        setUploading(false);
      }
    }, 2000);
  };

  const handleClickMetaAds = (runId, template_name) => {
    const templateName = template_name.replace(/ /g, "_");
    setShowMetaAds({
      ...showMetaAds,
      openModal: true,
      data: {
        runId: runId,
        template_name: templateName,
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
    <div className="flex flex-col w-full h-full ">
      <div className="flex h-12 sticky top-0 z-30 px-5  py-2 bg-amaranth-800 flex-row items-center justify-between w-full">
        <h3 className="  text-lg font-light text-white">Query status</h3>
      </div>
      {!loadingTable ? (
        <div className="flex flex-col w-full px-5 mt-4 ">
          <TableContainer>
            <Table
              sx={{ minWidth: 650, borderRadius: 0 }}
              stickyHeader
              size="small"
              classes={{ root: "w-100" }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontSize: "0.9rem",
                      fontWeight: 900,
                      // color: "#8c0f45",
                      // backgroundColor: "#fff1f4",
                      borderRadius: 0,
                      borderTop: 1,
                      borderLeft: 1,
                      borderColor: "#d6d3d1",
                    },
                    "& th:first-of-type": {
                      borderLeft: 1,
                      borderColor: "#d6d3d1",
                    },
                    "& th:last-child": {
                      borderRight: 1,
                      borderColor: "#d6d3d1",
                    },
                  }}
                >
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={0}
                    align="center"
                  >
                    Request ID
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={1}
                    align="center"
                  >
                    Template Name
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={2}
                    align="center"
                  >
                    Column Names
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={3}
                    align="center"
                  >
                    Identifier Type
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={4}
                    align="center"
                  >
                    Match Attribute
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={5}
                    align="center"
                  >
                    Match Count
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={6}
                    align="center"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={"Actions"}
                    align="center"
                  >
                    Actions
                  </TableCell>
                  <TableCell
                    className="bg-amaranth-50 text-amaranth-900"
                    key={7}
                    align="center"
                  >
                    Requested
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data &&
                  data
                    ?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    ?.map((row, index) => {
                      return (
                        <TableRow
                          className="border-gray-200 hover:bg-amaranth-50"
                          key={index}
                          sx={{
                            "& td:last-child": {
                              borderRight: 1,
                              borderColor: "#d6d3d1",
                            },
                            "& td": { borderLeft: 1, borderColor: "#d6d3d1" },
                          }}
                        >
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {row.RUN_ID}
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {row.TEMPLATE_NAME}
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {row.COLOUMNS}
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {row.IDENTIFIER_TYPE}
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {row.ATTRIBUTE}
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {row.MATCH_COUNT}
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            <span
                              className={`${
                                row.STATUS.toLowerCase() === "completed" ||
                                row.STATUS.toLowerCase() === "true"
                                  ? "bg-green-200 text-green-700 inline"
                                  : row.STATUS === "Failed" ||
                                    row.STATUS === "false"
                                  ? "bg-red-200 text-red-700 inline"
                                  : "text-amaranth-700 block bg-amaranth-200 h-[45px]"
                              }  text-xs py-1 px-3 rounded-full  `}
                            >
                              {row.STATUS.toLowerCase() === "true"
                                ? "Approved"
                                : row.STATUS.toLowerCase() === "false"
                                ? "Rejected"
                                : row.STATUS}
                            </span>
                          </TableCell>

                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            <div className="flex justify-between">
                              {row.STATUS.toLowerCase() === "failed" ||
                              row.STATUS.toLowerCase() === "false" ? (
                                <button
                                  onClick={() =>
                                    setRequestFailedReason({
                                      ...requestFailedReason,
                                      openModal: true,
                                      message: row.ERROR,
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
                                <div className="flex justify-start">
                                  <button
                                    onClick={() =>
                                      fetchcsvTableData(
                                        row.TEMPLATE_NAME,
                                        row.RUN_ID
                                      )
                                    }
                                    disabled={
                                      row.STATUS.toLowerCase() !== "completed"
                                    }
                                    className={`${
                                      row.STATUS.toLowerCase() === "completed"
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
                                  {(row.TEMPLATE_NAME ===
                                    "CUSTOMER ENRICHMENT" ||
                                    row.TEMPLATE_NAME ===
                                      "customer_enrichment") && (
                                    <button
                                      onClick={() =>
                                        downloadFile(
                                          row.TEMPLATE_NAME,
                                          row.RUN_ID
                                        )
                                      }
                                      disabled={
                                        row.STATUS.toLowerCase() !== "completed"
                                      }
                                      className={`${
                                        row.STATUS.toLowerCase() === "completed"
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
                                  )}
                                </div>
                              )}

                              {(row.TEMPLATE_NAME === "ADVERTISER MATCH" ||
                                row.TEMPLATE_NAME === "advertiser_match") &&
                              user.role &&
                              user?.role?.includes("Publisher") &&
                              user?.role?.includes("Consumer") ? (
                                <>
                                  {uploading &&
                                  row.UPL_INTO_CLI_SPACE?.toLowerCase() ===
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
                                      onClick={() =>
                                        handleUploadData(row.RUN_ID)
                                      }
                                      disabled={
                                        row.UPL_INTO_CLI_SPACE?.toLowerCase() ===
                                          "true" &&
                                        row.STATUS?.toLowerCase() ===
                                          "completed"
                                      }
                                      className={`${
                                        row.UPL_INTO_CLI_SPACE?.toLowerCase() !==
                                          "true" &&
                                        row.STATUS?.toLowerCase() ===
                                          "completed"
                                          ? "opacity-1 hover:text-inherit"
                                          : "disabled opacity-25 hover:text-inherit"
                                      }  px-2 hover:text-amaranth-600`}
                                      title={
                                        row.UPL_INTO_CLI_SPACE?.toLowerCase() ===
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
                                    onClick={() =>
                                      showAnalyticsPage(row.RUN_ID)
                                    }
                                    disabled={
                                      row.STATUS.toLowerCase() !== "completed"
                                    }
                                    className={`${
                                      row.STATUS.toLowerCase() === "completed"
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
                                        row.RUN_ID,
                                        row.TEMPLATE_NAME
                                      )
                                    }
                                    disabled={
                                      row.STATUS.toLowerCase() !== "completed"
                                    }
                                    className={`${
                                      row.STATUS.toLowerCase() === "completed"
                                        ? "opacity-1 hover:text-inherit"
                                        : "disabled opacity-25 hover:text-inherit"
                                    }  px-2 hover:text-amaranth-600 w-8`}
                                    title="Run Ad campaign on Meta ADs"
                                  >
                                    <img src={meta} alt="" />
                                  </button>
                                  <button
                                    // onClick={() => googleAd(row.RUN_ID)}
                                    disabled={
                                      row.STATUS.toLowerCase() !== "completed"
                                    }
                                    className={`${
                                      row.STATUS.toLowerCase() === "completed"
                                        ? "opacity-1 hover:text-inherit"
                                        : "disabled opacity-25 hover:text-inherit"
                                    }  px-2 hover:text-amaranth-600 w-8`}
                                    title="Run Ad Campaign on Google ads"
                                  >
                                    <img src={google} alt="" />
                                  </button>
                                    {/* LinkedInButton Added */}
                          <button
                            onClick={() =>
                              handleClickLinkedInAds(
                                row.RUN_ID,
                                row.TEMPLATE_NAME,
                                row.IDENTIFIER_TYPE
                              )
                            }
                            disabled={row.STATUS.toLowerCase() !== "completed"}
                            className={`${
                              row.STATUS.toLowerCase() === "completed"
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
                          </TableCell>
                          <TableCell
                            className="text-amaranth-900"
                            align="center"
                          >
                            {handleDate(row.RUN_ID)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={data?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      ) : (
        <div className="flex justify-center mt-8 ">
          <CircularProgress
            style={{
              width: "48px",
              height: "48px",
              color: "#234885",
            }}
          />
        </div>
      )}
      <Modal
        open={viewTemplate.openModal}
        onClose={handleResultModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={resultstyle}>
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
                <CustomTable
                  id={requestId}
                  head={tableHead}
                  rows={tableRows}
                  pagination={
                    viewTemplate.queryName === "ADVERTISER_MATCH"
                      ? "none"
                      : true
                  }
                />
              ) : null}
            </div>
          </div>
        </Box>
      </Modal>

      {requestFailedReason.openModal ? (
        <CommonModal
          open={requestFailedReason.openModal}
          handleClose={() =>
            setRequestFailedReason({ ...requestFailedReason, openModal: false })
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
  );
};

export default QueryStatus;
