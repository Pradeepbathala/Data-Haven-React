import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import HTWLogo from "../../Assets/Logos/Data_Haven_Logo.svg";
import axios from "axios";

import {
  loadCaptchaEnginge,
  validateCaptcha,
  LoadCanvasTemplateNoReload,
} from "react-simple-captcha";

const baseURL = process.env.REACT_APP_BASE_URL;

const Register = () => {
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    designation: "",
    company: "",
    userName: "",
    password: "",
    confirmPassword: "",
    accountRadio: "no",
    captcha: "",
  });
  const [errors, setErrors] = useState({
    fullName: null,
    email: null,
    designation: null,
    company: null,
    userName: null,
    password: null,
    confirmPassword: null,
    accountRadio: null,
    captcha: null,
  });

  const [formValidated, setFormValidated] = useState(false);

  const [note, setNote] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  const loadCaptchaAgain = () => {
    loadCaptchaEnginge(6);
  };

  useEffect(() => {
    let isValid =
      userDetails.fullName !== "" &&
      userDetails.email !== "" &&
      userDetails.designation !== "" &&
      userDetails.company !== "" &&
      userDetails.userName !== "" &&
      userDetails.password !== "" &&
      userDetails.confirmPassword !== "" &&
      userDetails.accountRadio !== "" &&
      errors.fullName === null &&
      errors.email === null &&
      errors.designation === null &&
      errors.company === null &&
      errors.userName === null &&
      errors.password === null &&
      errors.confirmPassword === null &&
      errors.accountRadio === null;
    setFormValidated(isValid);
  }, [userDetails, errors]);

  const validateEmail = (mail) => {
    var mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (mail.match(mailformat)) return true;
    else return false;
  };

  // const isValidInput = (input) => {
  //   const pattern = /^[a-zA-Z\s]+$/;
  //   return pattern.test(input);
  // };
  const isValidInput = (input) => {
    const specialCharactersRegex = /[!@#$%^&*~`()_+\-=[\]{};':"\\|,.<>/?]+/;
    const pattern = /^[a-zA-Z\s]+$/;

    if (specialCharactersRegex.test(input)) {
      return "specialCharacter";
    } else if (!pattern.test(input)) {
      return "number";
    } else {
      return "";
    }
  };

  const validatePassword = (password) => {
    // let regex =
    //   "^(?=.*[A-Za-z])(?=.*d)(?=.*[@#$%^&+=!])(?=.*[a-zA-Z0-9]).{8,}$"; // 1 letter(upper or lower), min 8 max 16, 1 number, 1 special char
    // let regex = '/(?=^.{8,24}$)(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/'; // Only letter and numbers, no special character
    // const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?=.*[a-zA-Z0-9@#$%^&+=!]).{8,}$/
    return password.match(
      /(?=^.{8,24}$)(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/
    );
  };

  const onChangehandler = (e) => {
    const emptyMsg = "Required field";

    const inputName = e.target.name;
    const inputValue = e.target.value;

    if (inputName === "fullName") {
      let character = isValidInput(inputValue);
      if (inputValue === "") {
        setErrors({ ...errors, fullName: emptyMsg });
      } else if (character === "specialCharacter") {
        setErrors({
          ...errors,
          fullName: "Special Characters are not allowed",
        });
      } else if (character === "number") {
        setErrors({ ...errors, fullName: "Numbers are not allowed" });
      } else {
        setErrors({ ...errors, fullName: null });
      }
    } else if (inputName === "designation") {
      let character = isValidInput(inputValue);
      if (inputValue === "") {
        setErrors({ ...errors, designation: emptyMsg });
      } else if (character === "specialCharacter") {
        setErrors({
          ...errors,
          designation: "Special Characters are not allowed",
        });
      } else if (character === "number") {
        setErrors({ ...errors, designation: "Numbers are not allowed" });
      } else {
        setErrors({ ...errors, designation: null });
      }
    } else if (inputName === "company") {
      if (inputValue === "") {
        setErrors({ ...errors, company: emptyMsg });
      } else {
        setErrors({ ...errors, company: null });
      }
    } else if (inputName === "email") {
      let isEmailValid = validateEmail(inputValue);
      if (inputValue === "") {
        setErrors({ ...errors, email: emptyMsg });
      } else if (!isEmailValid) {
        setErrors({ ...errors, email: "Please enter a valid email address." });
      } else {
        setErrors({ ...errors, email: null });
      }
    } else if (inputName === "userName") {
      if (inputValue === "") {
        setErrors({ ...errors, userName: emptyMsg });
      } else {
        setErrors({ ...errors, userName: null });
      }
    } else if (inputName === "password") {
      let isPasswordValid = validatePassword(inputValue);
      if (inputValue === "") {
        setErrors({ ...errors, password: emptyMsg });
      } else if (!isPasswordValid) {
        let passErrorMsg =
          "Password must be between 8 and 16 characters long and must contain one letters and numbers with special character is allowed";
        setErrors({ ...errors, password: passErrorMsg });
      } else {
        setErrors({ ...errors, password: null });
      }
    } else if (inputName === "confirmPassword") {
      if (inputValue === "") {
        setErrors({ ...errors, confirmPassword: emptyMsg });
      } else if (userDetails.password !== inputValue) {
        setErrors({ ...errors, confirmPassword: "Password doesn't match" });
      } else {
        setErrors({ ...errors, confirmPassword: null });
      }
    } else if (inputName === "accountRadio") {
      console.log("e.target", e.target.value);
    } else if (inputName === "captcha") {
      if (inputValue === "") {
        setErrors({ ...errors, captcha: "Please enter Captcha" });
      } else {
        setErrors({ ...errors, captcha: null });
      }
    }
    setUserDetails({ ...userDetails, [inputName]: inputValue });
  };

  const sendEmail = () => {
    setEmailLoading(true);
    //DONE...
    /*
    const payload ={
      const payload = {
      mailusedfor: "Forgot",
      recipient: data?.EMAIL,
      user_name: data?.USER,
      password: data?.PASSWORD,
      email_id: data?.EMAIL,
    };
    try {
      const response = await API.mailtoadmin(payload);
      if (response.status ===200) {
          setNote(
            "** Our Expert team will connect with you within next 24 hours for the further process. **"
          );
          setEmailLoading(false);
        } else {
          setNote("");
          setEmailLoading(false);
        }
    }
    catch (error){console.log(error);}
    */
    axios
      .get(`${baseURL}/mailtoadmin`, {
        params: {
          subject: `${userDetails?.fullName} wants to register.`,
          message: `Hello,
                        ${userDetails?.fullName} wants to register for Data Haven. He/she is filled the information as below.
                        
                        *Full Name    : ${userDetails?.fullName}
                        *Company Name : ${userDetails?.company}
                        *Designation  : ${userDetails?.designation}
                        *Email Id     : ${userDetails?.email}
                        *Does company
                        have snowflake
                        account       : ${userDetails?.accountRadio}
                        *User Name    : ${userDetails?.userName}
                        *Password     : ${userDetails?.password}

                        Please connect with ${userDetails?.fullName} as soon as possible for the completion of the registration process.`,
        },
      })
      .then((response) => {
        if (response) {
          setNote(
            "** Our Expert team will connect with you within next 24 hours for the further process. **"
          );
          setEmailLoading(false);
        } else {
          setNote("");
          setEmailLoading(false);
        }
      })
      .catch((error) => console.log(error));
  };

  const registerUser = () => {
  //PENDING..
    /*
    const payload ={};
    try {
      const response = await API.DEMO(payload);
      if (response.status === 200) {
          sendEmail();
        } else {
          setNote("Please, try Again to register.");
        }
    }
    catch (error){console.log(error);}
    */
    axios
      .get(`${baseURL}/Provider`, {
        params: {
          query: `INSERT INTO DCR_SAMP_PROVIDER_DB.SHARED_SCHEMA.user_details_registration(FULL_NAME,COMPANY,DESIGNATION,EMAIL_ID,SNOWFLAKE_ACCOUNT,USERNAME,PASSWORD) VALUES('${userDetails?.fullName}','${userDetails?.company}','${userDetails?.designation}','${userDetails?.email}','${userDetails?.accountRadio}','${userDetails?.userName}','${userDetails?.password}');`,
        },
      })
      .then((response) => {
        if (response) {
          sendEmail();
        } else {
          setNote("Please, try Again to register.");
        }
      })
      .catch((error) => console.log(error));
  };

  const handleSubmit = () => {
    if (validateCaptcha(userDetails?.captcha) === true) {
      loadCaptchaEnginge(6);
      setErrors({ ...errors, captcha: null });
      registerUser();
    } else {
      setErrors({ ...errors, captcha: "Please enter correct Captcha" });
      return;
    }

    toast.success("Registration has been successfull...");
  };

  // JSX code for login form
  const renderForm = (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <div className="flex flex-row   gap-2 border-b-[1px] border-opacity-50 border-amaranth-600 pb-4 mb-4">
          <div className="w-1/2 ">
            <div className="">
              <label
                htmlFor="fullname"
                className="block text-sm font-medium leading-6 text-amaranth-600"
              >
                Full name{" "}
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Aditi Nair"
                  onChange={onChangehandler}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
                />
                {errors.fullName !== null ? (
                  <span className="text-[#f44336] text-sm">
                    {errors.fullName}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="designation"
                className="block text-sm font-medium leading-6 text-amaranth-600"
              >
                Designation
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="designation"
                  placeholder="e.g. Associate"
                  onChange={onChangehandler}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
                />
                {errors.designation !== null ? (
                  <span className="text-[#f44336] text-sm">
                    {errors.designation}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="w-1/2">
            <div className="">
              <label
                htmlFor="company"
                className="block text-sm font-medium leading-6 text-amaranth-600"
              >
                Company
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. GroupM inc"
                  onChange={onChangehandler}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
                />
                {errors.company !== null ? (
                  <span className="text-[#f44336] text-sm">
                    {errors.company}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-amaranth-600"
              >
                Email Id
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="email"
                  placeholder="e.g. aditi.nair@groupm.com"
                  onChange={onChangehandler}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
                />
                {errors.email !== null ? (
                  <span className="text-[#f44336] text-sm">{errors.email}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="pb-4 flex flex-row border-b-[1px] border-opacity-50 border-amaranth-600">
          <div className=" ">
            <label className="block text-sm font-medium leading-6 text-amaranth-600">
              Does your company have a Snowflake account that will be used as a
              Tenant/Consumer account for data collaboration?
            </label>
            <div className="mt-2">
              <div className="flex justify-start">
                <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
                  <input
                    className="relative bg-white float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-amaranth-600 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-amaranth-600 checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-amaranth-600 checked:after:bg-amaranth-600 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-amaranth-600 checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#e91f64] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-amaranth-600 dark:checked:border-amaranth-600 dark:checked:after:border-amaranth-600 dark:checked:after:bg-amaranth-600 dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-amaranth-600  dark:checked:focus:before:shadow-[0px_0px_0px_13px_#e91f64]"
                    type="radio"
                    name="accountRadio"
                    value="yes"
                    checked={userDetails.accountRadio === "yes"}
                    onChange={onChangehandler}
                  />
                  <label
                    className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer text-amaranth-600"
                    htmlFor="inlineRadio1"
                  >
                    Yes
                  </label>
                </div>

                <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
                  <input
                    className="relative bg-white float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-amaranth-600 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-amaranth-600 checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-amaranth-600 checked:after:bg-amaranth-600 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-amaranth-600 dark:checked:border-amaranth-600 dark:checked:after:border-amaranth-600 dark:checked:after:bg-amaranth-600 dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-amaranth-600  dark:checked:focus:before:shadow-[0px_0px_0px_13px_#00FFB4]"
                    type="radio"
                    name="accountRadio"
                    value="no"
                    checked={userDetails.accountRadio === "no"}
                    onChange={onChangehandler}
                  />
                  <label
                    className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer text-amaranth-600"
                    htmlFor="inlineRadio2"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 pt-2 pb-4 mb-4 border-b-[1px] border-opacity-50 border-amaranth-600">
          <div className="w-1/3">
            <label
              htmlFor="userName"
              className="block text-sm font-medium leading-6 text-amaranth-600"
            >
              Username{" "}
            </label>
            <div className="mt-2">
              <input
                id="userName"
                type="text"
                name="userName"
                placeholder="e.g. aditi_nair"
                onChange={onChangehandler}
                required
                className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
              />
              {errors.userName !== null ? (
                <span className="text-[#f44336] text-sm">
                  {errors.userName}
                </span>
              ) : null}
            </div>
          </div>
          <div className="w-1/3 ">
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-amaranth-600"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                placeholder=" "
                required
                onChange={onChangehandler}
                className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
              />
              {errors.password !== null ? (
                <span className="text-[#f44336] text-sm">
                  Please check assumption
                </span>
              ) : null}
            </div>
          </div>
          <div className="w-1/3">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium leading-6 text-amaranth-600"
            >
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                type="password"
                name="confirmPassword"
                placeholder=" "
                required
                onChange={onChangehandler}
                className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
              />
              {errors.confirmPassword !== null ? (
                <span className="text-[#f44336] text-sm">
                  {errors.confirmPassword}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {errors.password !== null && (
          <span className="text-[#f44336] text-sm">
            Password Policy : Password must be between 8 and 16 characters long and must contain one letters and numbers (special character is NOT allowed).
          </span>
        )}
      </div>
      <div className="flex items-center">
        <div className="mx-2">
          <label
            htmlFor="captcha"
            className="block text-sm font-medium leading-6 text-amaranth-600"
          >
            Your Captcha
          </label>
          <div className="flex mx-0 items-center justify-between bg-[#E8F4FE] h-[45px] rounded-md px-4">
            <div>
              <LoadCanvasTemplateNoReload
                reloadColor="red"
                reloadText="reload"
              />
            </div>
            <div
              className="align-center text-xl cursor-pointer"
              onClick={loadCaptchaAgain}
            >
              &#x21bb;
            </div>
          </div>
        </div>
        <div className="mx-2">
          <label
            htmlFor="captcha"
            className="block text-sm font-medium leading-6 text-amaranth-600"
          >
            Enter Captcha
          </label>
          <input
            id="user_captcha_input"
            type="text"
            name="captcha"
            placeholder="Please enter your Captcha"
            required
            onChange={onChangehandler}
            className="block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken bg-white shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
          />
          {errors.captcha !== null ? (
            <span className="text-[#f44336] text-sm">{errors.captcha}</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-row mt-4 gap-2 justify-center">
        <a
          href={"/"}
          className="flex  justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold leading-6 text-amaranth-600 hover:text-white shadow-sm hover:bg-amaranth-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anaranth-600 border border-amaranth-600"
        >
          Back
        </a>
        <button
          disabled={!formValidated}
          onClick={handleSubmit}
          className=" w-max flex items-center px-2 py-2  text-sm text-white bg-amaranth-600 rounded-md   hover:bg-amaranth-700 px-3 py-1.5 text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-green"
        >
          {emailLoading ? (
            <CircularProgress
              style={{ width: "24px", height: "24px", color: "#FFFFFF" }}
            />
          ) : (
            "Submit"
          )}
        </button>
      </div>
      <div className="w-full max-w-full px-3 py-3sm:flex-0 shrink-0 sm:w-6/12 lg:w-full">
        {note !== "" ? (
          <span className="text-amaranth-950 text-sm">{note}</span>
        ) : (
          ""
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-stone-300 flex flex-row  p-9 lg:p-13 xl:p-15 min-h-screen ">
        <div className="flex flex-row mx-auto max-w-[70%]    max-h-auto bg-white rounded-3xl shadow-lg shadow-stone-400">
          <div className="w-1/2 px-6 py-4">
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
            <div className="flex flex-col items-center my-6">
              <h2 className=" mb-2 text-center text-4xl font-extrabold  tracking-tight    leading-9 text-amaranth-600 ">
                Register today!
              </h2>
              {/* <span className="text-center font-normal text-stone-800 text-sm">Register yourself today.</span> */}
            </div>

            <div className="flex items-start justify-center my-auto">
              {renderForm}
            </div>
          </div>
          <div className="w-1/2 h-full flex flex-col items-center justify-center overflow-hidden relative bg-gradient-to-br from-amaranth-100 to-purple-200 rounded-r-3xl px-6">
            {/* <h2 className="font-light text-4xl tracking-tighter text-purple-800">Proudly made by</h2> */}
            <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-amaranth-600 to-purple-800">
              Secure data collaboration with DataHaven
              <span className="font-bold text-4xl text-amaranth-500">.</span>
            </h1>
            {/* <h3 className="absolute w-4/5 text-2xl font-semibold  bottom-10 left-4 text-white z-40">Go anywhere you want in a Galaxy full of wonders!</h3> */}
            {/* <img src={Astro} className="absolute z-10 top-0 h-full object-cover rounded-r-3xl brightness-120  opacity-90" /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
