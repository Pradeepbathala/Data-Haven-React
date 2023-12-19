import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Alert, CircularProgress } from "@mui/material";
import md5 from "md5";

import HTWLogo from "../../Assets/Logos/Data_Haven_Logo.svg";
import API from "../../apiServices/api";

import * as actions from "../../redux/actions/index";
const reactAppAuthURL = process.env.REACT_APP_BASE_URL_AUTH;
const reactAppAuthAccessToken = process.env.REACT_APP_AUTH_ACCESS_TOKEN;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginDetails, setLoginDetails] = useState({
    userName: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    userName: null,
    password: null,
    message: "",
  });
  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(false);

  // Show toaster when Access token has expired..
  const loginErrorMessage = localStorage.getItem("loginErrorMessage");

  if (loginErrorMessage) {
    toast.error(loginErrorMessage);
    localStorage.removeItem("loginErrorMessage");
  }

  const handleOnChange = (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.value;
    setLoginError("");
    if (inputName === "userName") {
      if (inputValue === "") {
        setErrors({ ...errors, userName: "Please enter User Name" });
      } else {
        setErrors({ ...errors, userName: null });
      }
    } else if (inputName === "password") {
      if (inputValue === "") {
        setErrors({ ...errors, password: "Please enter password" });
      } else {
        setErrors({ ...errors, password: null });
      }
    }
    setLoginDetails({ ...loginDetails, [inputName]: inputValue });
  };

  const getAllConsumers = async (userRole, partyAccount) => {
    const payload = {
      account_name: loginDetails?.userName,
      user: loginDetails?.userName,
      // provider_database_name: user?.
    };
    try {
      const response = await API.getAdminPartyAccountApi(payload);
      if (response?.status === 200 && response?.data?.data) {
        let data_consumer = response?.data?.data?.[0];

        const payload = {
          account_name: data_consumer?.USER,
          user: loginDetails?.userName,
          password: md5(loginDetails?.password),
        };
        // to check user is blocked or not...
        try {
          const response = await API.checkBlockedUser(payload);
          if (
            response?.status === 200 &&
            response?.data?.data &&
            response?.data?.data?.toUpperCase() === "TRUE"
          ) {
            try {
              const response = await API.getAuthorisationApi(payload);
              if (response?.status === 200 && response?.data?.data) {
                if (parseInt(response?.data?.data[0]?.COUNT) === 1) {
                  const payload = {
                    account_name: loginDetails?.userName,
                    user: loginDetails?.userName,
                  };
                  try {
                    const response = await API.getAuthorisedUserDetailsApi(
                      payload
                    );
                    if (response?.status === 200 && response?.data?.data) {
                      let data = response?.data?.data; // Find user login info]
                      if (data?.length > 0) {
                        const userData = data && data[0];

                        const userRole = [];
                        if (userData?.PUBLISHER?.toLowerCase() === "true") {
                          userRole.push("Publisher");
                        }
                        if (userData?.PROVIDER?.toLowerCase() === "true") {
                          userRole.push("Provider");
                        }
                        if (userData?.CONSUMER?.toLowerCase() === "true") {
                          userRole.push("Consumer");
                        }
                        if (
                          userData?.PROVIDER?.toLowerCase() === "true" &&
                          userData?.ADMIN?.toLowerCase() === "true"
                        ) {
                          userRole.push("Provider_Admin");
                        }

                        if (
                          userData?.CONSUMER?.toLowerCase() === "true" &&
                          userData?.ADMIN?.toLowerCase() === "true"
                        ) {
                          userRole.push("Consumer_Admin");
                        }
                        dispatch(
                          actions.loginRequest({
                            isLoggedIn: true,
                            name: loginDetails?.userName,
                            role: userRole,
                            ConsumerPartyAccount: userData?.PARTY_ACCOUNT,
                            Consumer: data_consumer?.USER,
                            consumerDBName: `DCR_SAMP_CONSUMER1`,
                            providerDBName: `DCR_SAMP_PROVIDER_DB`,
                          })
                        );
                        navigate("/home");
                      } else {
                        // Username not found
                        setLoading(false);
                        setLoginError("Invalid Credentials");
                        toast.error(
                          "You entered an incorrect username, password or both."
                        );
                      }
                    } else {
                      setLoginError("Invalid Credentials");
                      setLoading(false);
                    }
                  } catch (error) {
                    setLoginError("Invalid Credentials");
                    setLoading(false);
                  }
                } else {
                  setLoginError(response?.data?.data);
                  setLoading(false);
                }
              } else {
                setLoginError("Invalid Credentials");
                setLoading(false);
              }
            } catch (error) {
              setLoginError(
                "We are facing some issue in Login. Please try again after sometime"
              );
              setLoading(false);
            }
          } else if (response?.status === 200 && response?.data?.data) {
            setLoginError(response?.data?.data);
            setLoading(false);
          } else {
            setLoginError(
              "We are facing some issue in Login. Please try again after sometime"
            );
            setLoading(false);
          }
        } catch (error) {
          setLoginError(
            "We are facing some issue in Login. Please try again after sometime"
          );
          setLoading(false);
        }
      } else {
        setLoading(false);
        setLoginError("We are facing issue. Please try again after sometime!!");
      }
    } catch (error) {
      setLoading(false);
      setLoginError("We are facing issue. Please try again after sometime!!");
    }
  };

  const handleSubmit = async (event) => {
    //Prevent page reload
    event.preventDefault();
    if (loginDetails?.userName === "") {
      setErrors({ ...errors, userName: "Please enter User name" });
      return;
    } else if (loginDetails?.password === "") {
      setErrors({ ...errors, password: "Please enter password" });
      return;
    }

    if (loginDetails?.userName !== "" || loginDetails?.password !== "") {
      setLoading(true);
      // get Access token...
      axios
        .get(
          `${reactAppAuthURL}/fetch_access_token?user=${loginDetails?.userName}`,
          {
            headers: {
              Authorization: `Bearer ${md5(reactAppAuthAccessToken)}`,
            },
          }
        )
        .then(async (response) => {
          if (response?.status === 200 && response?.data) {
            localStorage.setItem("access_token", response?.data?.access_token);
            localStorage.setItem("session_id", response?.data?.session_id);
            localStorage.setItem("token_expiry", response?.data?.token_expiry);

            getAllConsumers();
          }
        })
        .catch((error) => {
          setLoginError(
            "We are facing some issue while connecting to server. Please try again after sometime"
          );
          setLoading(false);
          console.log(error);
        });
    }
  };

  // JSX code for login form
  const renderForm = (
    <div className="flex flex-col justify-center items-center space-y-6  w-4/5">
      <div className=" w-full">
        <label
          htmlFor="uname"
          className="block text-sm font-medium leading-6 text-amaranth-600 "
        >
          User Name{" "}
        </label>
        <div className="mt-2">
          <input
            id="userName"
            type="text"
            name="userName"
            placeholder="Please enter a username. e.g. aditi_nair"
            onChange={handleOnChange}
            required
            className="block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          />
          {errors.userName !== null ? (
            <span className="text-[#f44336] text-sm">{errors.userName}</span>
          ) : null}
        </div>
      </div>
      <div className=" w-full">
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-amaranth-600 "
        >
          Password
        </label>
        <div className="mt-2">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Please enter your password."
            required
            onChange={handleOnChange}
            className="block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken   shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          />
          {errors.password !== null ? (
            <span className="text-[#f44336] text-sm">{errors.password}</span>
          ) : null}
        </div>
      </div>

      <div className=" w-full">
        <button
          onClick={handleSubmit}
          className=" rounded-3xl flex w-full justify-center  text-white bg-amaranth-600  px-3 py-1.5 text-sm font-semibold leading-6 text-stone-700shadow-sm hover:bg-amaranth-600  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-600 "
        >
          {loading ? (
            <CircularProgress
              style={{ width: "24px", height: "24px", color: "#FFFFFF" }}
            />
          ) : (
            "Log In"
          )}
        </button>
      </div>
      <div className="my-2">
        <span
          className="text-sm font-medium leading-6 text-amaranth-600 cursor-pointer"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </span>
      </div>
      {/* for showing error */}
      <div className="my-4">
        {loginError !== "" && (
          <Alert className="text-red-600" severity="error">
            {loginError}
          </Alert>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-stone-300 flex flex-row  p-12 lg:p-24 xl:p-26 min-h-screen ">
      <div className="flex flex-row mx-auto max-w-[40%] max-h-auto bg-white rounded-3xl shadow-lg shadow-stone-400">
        <div className="w-full px-6 py-4">
          <div className=" flex flex-row items-start justify-start py-4 ">
            <a
              href="/"
              className="flex items-center mb-5 font-medium text-gray-900 lg:w-auto lg:items-center lg:justify-center md:mb-0"
            >
              <span className="flex flex-row items-center mx-auto text-xl font-black leading-none text-gray-900 select-none">
                <img src={HTWLogo} className="w-52 mr-2" alt="" />
              </span>
            </a>
          </div>
          <div flex flex-col items-center my-6>
            <h1 className="text-4xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-br from-amaranth-600 to-purple-800">
              Secure data collaboration with DataHaven
            </h1>
          </div>
          <div className="flex flex-col items-center my-6">
            <h2 className="mt-8 mb-2 text-center text-6xl font-extrabold  tracking-tight    leading-9 text-amaranth-600 ">
              Hi there!
            </h2>
            <span className="text-center font-normal text-stone-800 text-sm">
              Welcome to DataHaven. Your trusted partner.
            </span>
          </div>

          <div className="flex items-start justify-center my-auto">
            {renderForm}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
