import React from "react";
import { useState } from "react";
import axios from "axios";

import {
  Alert,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

// import BgVideo from "../../Assets/loginbg.mp4";
// import BgVideoGreen from "../../Assets/loginbg_green.mp4";

import ModalForgotPassword from "./ModalForgotPassword";

const baseURL = process.env.REACT_APP_BASE_URL;
const redirectionUser = process.env.REACT_APP_REDIRECTION_URL;

const ForgotPassword = () => {
  const [forgotPassword, setForgotPassword] = useState(false);
  const [radio, setRadio] = useState("yes");

  const [details, setDetails] = useState({
    userName: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    userName: null,
    email: null,
  });

  const [outputError, setOutputError] = useState(null);
  const [loader, setLoader] = useState(false);

  const handleChange = (event) => {
    setRadio(event.target.value);
  };

  const validateEmail = (mail) => {
    var mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (mail.match(mailformat)) return true;
    else return false;
  };

  const handleOnChange = (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.value;
    setOutputError(null);
    if (inputName === "userName") {
      if (inputValue === "") {
        setErrors({ ...errors, userName: "Please enter User Name" });
      } else {
        setErrors({ ...errors, userName: null });
      }
    } else if (inputName === "email") {
      let isEmailValid = validateEmail(inputValue);
      if (inputValue === "") {
        setErrors({ ...errors, email: "Please enter Email" });
      } else if (!isEmailValid) {
        setErrors({ ...errors, email: "Please enter a valid email address." });
      } else {
        setErrors({ ...errors, email: null });
      }
    }
    setDetails({ ...details, [inputName]: inputValue });
  };

  const sendEmail = (data) => {
    //pending..
    /*
   const payload = {};
   try{
    const response = await API.DEMO(payload);
    if (response) {
          setOutputError(null);
          setForgotPassword(true);
          setLoader(false);
        } else {
          setOutputError(
            "There is an issue to send the mail Please try again later."
          );
          setLoader(false);
        }

   }
   catch (error){
    setOutputError(
          "There is an issue to send the mail Please try again later."
        );
        setLoader(false);

    console.log(error);}
    */
    axios
      .get(`${baseURL}/mailtoadmin`, {
        params: {
          recipient: `${data?.EMAIL}`,
          subject: `Forgot Password for user ${data?.USER}`,
          message: `Hello,
                      Please check your User Name followed by Password below: 
                        User Name: ${data?.USER}
                        Password: ${data?.PASSWORD}
                        Email: ${data?.EMAIL}
                        
                      Please use the above credentials to login again. 
                    Thanks and Regards,
                    Data Exchange`,
        },
      })
      .then((response) => {
        if (response) {
          setOutputError(null);
          setForgotPassword(true);
          setLoader(false);
        } else {
          setOutputError(
            "There is an issue to send the mail Please try again later."
          );
          setLoader(false);
        }
      })
      .catch((error) => {
        setOutputError(
          "There is an issue to send the mail Please try again later."
        );
        setLoader(false);

        console.log(error);
      });
  };

  const getUsersData = (userName) => {
    //done...
    /*
   const payload = {
      account_name: userName,
      user_name: userName,
   };
   try{
      const response = await API.getUserData(payload);
      if (response?.data?.data) {
          sendEmail(response?.data?.data[0]);
        } else {
          setOutputError(
            "Invalid User Name. Please check the user Name again!"
          );
          setLoader(false);
        }
     
   }
   catch (error){
       setOutputError("Invalid User Name. Please check the user Name again!");
        setLoader(false);
      console.log(error);}
    */
    axios
      .get(`${baseURL}/${userName}`, {
        params: {
          query: `select * from DATAEXCHANGE_ADMIN.ADMIN.USER_CREDENTIALS where user = '${userName}';`,
        },
      })

      .then((response) => {
        if (response?.data?.data) {
          sendEmail(response?.data?.data[0]);
        } else {
          setOutputError(
            "Invalid User Name. Please check the user Name again!"
          );
          setLoader(false);
        }
      })
      .catch((error) => {
        setOutputError("Invalid User Name. Please check the user Name again!");
        setLoader(false);

        console.log(error);
      });
  };

  const handleForgotPassword = () => {
    if (
      errors.userName !== null ||
      errors.email !== null ||
      details.userName === "" ||
      details.email === ""
    ) {
      setErrors({
        ...errors,
        userName: "Required Field",
        email: "Required Field",
      });
      return;
    } else {
      setLoader(true);
      if (radio === "no") {
        //done...
        /*
        const payload = {
           account_name: redirectionUser,
          email_id: details.email,
        };
        try{
          const response = await API.getUserNameFromEmail(payload);
          if (response?.data?.data?.length > 0) {
              getUsersData(response?.data?.data[0]?.USERNAME);
            } else {
              setOutputError(
                "Invalid Email Id. Please check the Email Id again!"
              );
              setLoader(false);
            }
          })
        }
        catch(error){
          setOutputError(
              "Invalid Email Id. Please check the Email Id again!"
            );
            setLoader(false);
            console.log(error);
        }
        */
        axios
          .get(`${baseURL}/${redirectionUser}`, {
            params: {
              query: `select USERNAME from DATAEXCHANGEDB.DATACATALOG.USER_DETAILS_REGISTRATION where email_id='${details.email}'`,
            },
          })
          .then((response) => {
            if (response?.data?.data?.length > 0) {
              getUsersData(response?.data?.data[0]?.USERNAME);
            } else {
              setOutputError(
                "Invalid Email Id. Please check the Email Id again!"
              );
              setLoader(false);
            }
          })
          .catch((error) => {
            setOutputError(
              "Invalid Email Id. Please check the Email Id again!"
            );
            setLoader(false);
            console.log(error);
          });
      } else {
        getUsersData(details.userName);
      }
    }
  };

  return (
    <div className="bg-stone-300 flex flex-row  p-12 lg:p-24 xl:p-26 min-h-screen ">
      <div className="flex flex-row mx-auto max-w-[40%] max-h-[auto] bg-white rounded-3xl shadow-lg shadow-stone-400">
      <div className="w-full px-6 py-4">
        <h2 className="mt-10 mb-10 text-center text-underline text-2xl font-bold leading-9 tracking-tight text-amaranth-600">
          Forgot User Name or Password
        </h2>
        <div className="space-y-6">
          <div className="block text-sm font-medium leading-6 text-amaranth-600 ">
            <div className="my-4">
              <FormControl>
                <FormLabel
                  id="demo-radio-buttons-group-label"
                  className="text-base font-medium leading-6 text-amaranth-600"
                >
                  Do you remember your User Name?
                </FormLabel>
                <RadioGroup
                  defaultValue="yes"
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  value={radio}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio className="text-amaranth-600" />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio className="text-amaranth-600" />}
                    label="No"
                  />
                </RadioGroup>
              </FormControl>
            </div>
            {radio === "yes" && (
              <div className="py-4 border-t-[1px] border-opacity-50 border-amaranth-600 ">
                <label
                  htmlFor="uname"
                  className="flex text-sm font-medium leading-6 text-amaranth-600"
                >
                  User Name<p className="text-red-600 pl-1">*</p>
                </label>
                <div className="mt-2">
                  <input
                    id="userName"
                    type="text"
                    name="userName"
                    placeholder="Please enter a username. e.g. aditi_nair"
                    onChange={handleOnChange}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken shadow-sm ring-1 ring-inset ring-true-teal placeholder:text-true-teal focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
                  />
                  {errors.userName !== null ? (
                    <span className="text-[#f44336] text-sm">
                      {errors.userName}
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          {radio === "no" && (
            <div className="block text-sm font-medium leading-6 text-amaranth-600 ">
              <div className="py-4 border-t-[1px] border-opacity-50 border-amaranth-600 ">
                <label
                  htmlFor="uname"
                  className="flex text-sm font-medium leading-6 text-amaranth-600 "
                >
                  Registered Email<p className="text-red-600 pl-1">*</p>
                </label>
                <div className="mt-2">
                  <input
                    id="userName"
                    type="text"
                    name="email"
                    placeholder="e.g. aditi.nair@groupm.com"
                    onChange={handleOnChange}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken shadow-sm ring-1 ring-inset ring-true-teal placeholder:text-true-teal focus:ring-2 focus:ring-inset focus:ring-amarnth-600 sm:text-sm sm:leading-6"
                  />
                  {errors?.email && errors?.email !== null ? (
                    <span className="text-[#f44336] text-sm">
                      {errors.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}
          <div>
            {loader ? (
              <div className="flex w-full justify-center rounded-md bg-electric-green px-3 py-1.5 text-sm font-semibold leading-6 text-amaranth-600 shadow-sm hover:bg-true-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-600">
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
                onClick={handleForgotPassword}
                className="flex w-full justify-center rounded-md bg-amaranth-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-true-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amaranth-600"
              >
                Submit
              </button>
            )}
          </div>
        </div>
        <div className="my-4">
          {outputError && (
            <Alert className="text-red-600" severity="error">
              {outputError}
            </Alert>
          )}
        </div>
      </div>
      <div>
        {forgotPassword ? (
          <ModalForgotPassword
            open={forgotPassword}
            handleClose={() => setForgotPassword(!forgotPassword)}
          />
        ) : null}
      </div>
      </div>
    </div>
  );
};

export default ForgotPassword;