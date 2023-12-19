import React, { useEffect, useState } from "react";
import Switch from "@mui/material/Switch";
import { Box, CircularProgress, Modal } from "@mui/material";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import API from "../../../apiServices/api";

const ProfileTable = ({ user, UserRole }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const [disableTemplate, setDisableTemplate] = useState(false);
  const handleCloseDisableTemplate = () => {
    setDisableTemplate(!disableTemplate);
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

  const fetchProfileTable = async () => {
    const payload = {
      account_name: user?.Consumer,
      role: UserRole?.includes("Consumer_Admin") ? "admin" : "provider",
    };
    try {
      const response = await API.fetchUserProfile(payload);
      if (response.status === 200 && response?.data?.data) {
        setData(response?.data?.data);
        setLoadingTable(false);
      } else {
        setData([]);
        setLoadingTable(false);
      }
    } catch (error) {
      setLoadingTable(false);
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    setLoadingTable(true);
    fetchProfileTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, UserRole]);

  const handleRole = async (status, userName, role) => {
    setLoading(true);
    setDisableTemplate(!disableTemplate);

    const payload = {
      account_name: user?.Consumer,
      provider_database_name: user?.providerDBName,
      role: role,
      status: status,
      userName: userName,
    };
    try {
      const response = await API.updateUserProfile(payload);
      if (response.status === 200 && response?.data?.data) {
        fetchProfileTable();
        setLoading(false);
      }
    } catch (error) {
      setLoadingTable(false);
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 w-11/12">
      {!loadingTable ? (
        <TableContainer className="mt-6">
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
                    color: "#8c0f45",
                    backgroundColor: "#fff1f4",
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
                  User
                </TableCell>
                <TableCell
                  className="bg-amaranth-50 text-amaranth-900"
                  key={1}
                  align="center"
                >
                  Consumer
                </TableCell>
                <TableCell
                  className="bg-amaranth-50 text-amaranth-900"
                  key={1}
                  align="center"
                >
                  Publisher
                </TableCell>
                <TableCell
                  className="bg-amaranth-50 text-amaranth-900"
                  key={1}
                  align="center"
                >
                  Provider
                </TableCell>
                <TableCell
                  className="bg-amaranth-50 text-amaranth-900"
                  key={2}
                  align="center"
                >
                  Auth role
                </TableCell>
              </TableRow>
            </TableHead>
            {UserRole?.includes("Provider_Admin") ? (
              <TableBody>
                {data?.map((row, index) => {
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
                      <TableCell className="text-amaranth-900" align="center">
                        {row.USER}
                      </TableCell>

                      <TableCell className="text-amaranth-900 " align="center">
                        {row.PROVIDER.toLowerCase() !== "true" ? (
                          <Switch
                            checked={row.CONSUMER.toLowerCase() === "true"}
                            onChange={() =>
                              handleRole(
                                row.CONSUMER.toLowerCase() === "true"
                                  ? "FALSE"
                                  : "TRUE",
                                row.USER,
                                "CONSUMER"
                              )
                            }
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        ) : (
                          <div className="flex justify-center">
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
                                d="M19.5 12h-15"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-amaranth-900 " align="center">
                        {row.PROVIDER.toLowerCase() !== "true" ? (
                          <Switch
                            checked={row.PUBLISHER.toLowerCase() === "true"}
                            onChange={() =>
                              handleRole(
                                row.PUBLISHER.toLowerCase() === "true"
                                  ? "FALSE"
                                  : "TRUE",
                                row.USER,
                                "PUBLISHER"
                              )
                            }
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        ) : (
                          <div className="flex justify-center">
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
                                d="M19.5 12h-15"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-amaranth-900" align="center">
                        {row.PROVIDER.toLowerCase() === "true" ? (
                          "PROVIDER"
                        ) : (
                          <div className="flex justify-center">
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
                                d="M19.5 12h-15"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-amaranth-900" align="center">
                        {row.PROVIDER.toLowerCase() !== "true" ? (
                          <Switch
                            checked={row.ADMIN.toLowerCase() === "true"}
                            onChange={() =>
                              handleRole(
                                row.ADMIN.toLowerCase() === "true"
                                  ? "FALSE"
                                  : "TRUE",
                                row.USER,
                                "ADMIN"
                              )
                            }
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        ) : row.PROVIDER.toLowerCase() === "true" &&
                          row.ADMIN.toLowerCase() === "true" ? (
                          "ADMIN"
                        ) : (
                          <div className="flex justify-center">
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
                                d="M19.5 12h-15"
                              />
                            </svg>
                          </div>
                        )}
                        {/* {row.ADMIN.toLowerCase() === "true" ? "ADMIN"
                      : row.CONSUMER.toLowerCase() === "true" && row.ADMIN.toLowerCase() === "false" ? "CONSUMER" : "PROVIDER"} */}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : (
              <TableBody>
                {data?.map((row, index) => {
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
                      <TableCell className="text-amaranth-900" align="center">
                        {row.USER}
                      </TableCell>

                      <TableCell className="text-amaranth-900 " align="center">
                        {row.CONSUMER.toLowerCase() === "true" ? (
                          <div className="flex justify-center">
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
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex justify-center">
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-amaranth-900 " align="center">
                        {row.PUBLISHER.toLowerCase() === "true" ? (
                          <div className="flex justify-center">
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
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex justify-center">
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-amaranth-900" align="center">
                        {row.PROVIDER.toLowerCase() === "true" ? (
                          <div className="flex justify-center">
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
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex justify-center">
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-amaranth-900" align="center">
                        {row.ADMIN.toLowerCase() === "true" ? (
                          <div className="flex justify-center">
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
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex justify-center">
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      ) : (
        <div className="flex justify-center">
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
        open={disableTemplate}
        onClose={handleCloseDisableTemplate}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {loading ? (
          <Box sx={style}>
            <div className="flex flex-row items-center justify-between sticky z-30 py-2 px-4 top-0 w-full text-amaranth-600">
              <CircularProgress
                style={{
                  width: "24px",
                  height: "24px",
                  color: "amaranth-600",
                }}
              />
              <h3 className="font-bold text-amaranth-600 p-4">
                Wait we are changing the role....
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
        ) : (
          <Box sx={style}>
            <div className="flex flex-row items-center justify-between sticky z-30 py-2 px-4 top-0 w-full text-amaranth-900">
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
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <h3 className="font-bold text-amaranth-900 p-4">
                Role has been changed.
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
        )}
      </Modal>
    </div>
  );
};

export default ProfileTable;
