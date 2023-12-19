import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("access_token");
    const sessionId = localStorage.getItem("session_id");
    const tokenExpiry = localStorage.getItem("token_expiry");

    request.baseURL = baseURL;
    request.headers.Authorization = `Bearer ${accessToken}`;
    request.headers["X-Session-ID"] = sessionId;
    request.headers["X-Token-Expiry"] = tokenExpiry;

    // Encode the username and password as a Base64 string
    // const credentials = btoa(`${backendUserName}:${backendPassword}`);
    // request.headers.Authorization = `Basic ${credentials}`;

    return request;
  },
  (error) => errorHandler(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // for Unauthorise Access push user to login page
    if (response.status === 401) {
    }
    return response;
  },
  (error) => errorHandler(error)
);

const errorHandler = (error) => {
  let errorMsg = {};
  if (
    error.response &&
    error.response.status &&
    error.response.status === 401
  ) {
    localStorage.setItem(
      "loginErrorMessage",
      "Your previous login session has expired. Please login again to use the platform."
    );
    window.location.href = "/login";
  }

  if (error.response && error.response.data && error.response.data) {
    errorMsg = error.response.data;
  }
  return Promise.reject(errorMsg);
};

// axiosInstance.defaults.headers.common['AccessToken'] = token;

export const setInterceptor = () => {
  axiosInstance.interceptors.response.use(
    (res) => {
      return res;
    },
    (err) => {
      const error = err.response;
      let errorMsg;
      if (error && error.status === 401) {
        errorMsg = `Your previous login session has expired. Please login again to use the platform.`;
      }
      if (error && error.status === 403) {
        errorMsg = error.status;
      }
      return Promise.reject(
        errorMsg ||
          `Sorry, some system issue. Please try again and if issue still persists, please report to our team at publir`
      );
    }
  );
};

export default axiosInstance;
