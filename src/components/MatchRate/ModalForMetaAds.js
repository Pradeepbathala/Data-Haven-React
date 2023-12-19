import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Modal } from "@mui/material";
import { useSelector } from "react-redux";
import API from "../../apiServices/api";

import { handleDate } from "../../utils/commonFunctions";

// Modal style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "415px",
  bgcolor: "background.paper",
  p: 4,
  borderRadius: 5,
};

const initialState = {
  id: "",
  name: "",
};

const ModalForMetaAds = ({ open, handleClose, data }) => {
  const state = useSelector((state) => state);
  const user = state && state.user;

  const [campaignList, setCampaignList] = useState([]);

  const [campaignData, setCampaignData] = useState(initialState);

  const [status, setStatus] = useState("");
  const [audienceUploaded, setAudienceUploaded] = useState(false);

  const [buttonStatus, setButtonStatus] = useState("Activate");
  const [loader, setLoader] = useState({
    audienceLoader: false,
    activateLoader: false,
  });

  const handleCampaignData = (event) => {
    let selectedObject = initialState;
    if (event.target.value !== "") {
      selectedObject = campaignList?.find(
        (item) => item?.name === event.target.value
      );
    }
    setCampaignData(selectedObject);
  };

  useEffect(() => {
    const fetch_campaigns = async () => {
      const payload = {
        account_name: user?.Consumer,
        run_id: data?.runId,
      };
      try {
        const response = await API.fetch_campaigns(payload);
        if (response.status === 200 && response?.data?.data) {
          let fetchResult = response?.data?.data;
          setCampaignList(fetchResult);

          try {
            const response = await API.display_logs(payload);
            if (
              response.status === 200 &&
              response?.data?.data &&
              response?.data?.data?.length > 0
            ) {
              let result = response?.data?.data[0];
              setStatus(
                `${result.STATUS} at ${handleDate(
                  result?.UPLOAD_TS ||
                    result?.ACTIVATED_TS ||
                    result?.DEACTIVATED_TS
                )}`
              );
              setButtonStatus(
                result?.ACTIVATED_TS === null ? "Activate" : "De-activate"
              );
              setAudienceUploaded(
                result?.UPLOAD_TS === null ||
                  result?.ACTIVATED_TS === null ||
                  result?.DEACTIVATED_TS === null
              );
              let selectedObject = initialState;
              selectedObject = fetchResult?.find(
                (item) => item?.id === result?.CAMPAIGN_ID
              );

              setCampaignData(selectedObject);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetch_campaigns();
  }, [user?.Consumer, data?.runId]);

  const handleUploadAudience = async () => {
    setLoader({ ...loader, audienceLoader: true });
    const payload = {
      account_name: user?.Consumer,
      run_id: data?.runId,
      templateName: data?.template_name,
      campaign_id: campaignData?.id,
      consumer_database_name: "DCR_SAMP_CONSUMER1",
    };
    try {
      const response = await API.uploadAudience(payload);
      if (
        response.status === 200 &&
        response?.data?.data &&
        response?.data?.data?.length > 0
      ) {
        let result = response?.data?.data[0];
        setStatus(`${result.STATUS} at ${handleDate(result?.UPLOAD_TS)}`);
        setLoader({ ...loader, audienceLoader: false });
        setAudienceUploaded(true);
      } else {
        setLoader({ ...loader, audienceLoader: false });
      }
    } catch (error) {
      setLoader({ ...loader, audienceLoader: false });
      console.error("Error fetching data:", error);
    }
  };

  const handleActivate = async (status) => {
    const payload = {
      account_name: user?.Consumer,
      run_id: data?.runId,
      campaign_id: campaignData?.id,
    };
    if (status === "Activate") {
      setLoader({ ...loader, activateLoader: true });
      try {
        const response = await API.publishMetaAds(payload);
        if (
          response.status === 200 &&
          response?.data?.data &&
          response?.data?.data?.length > 0
        ) {
          let result = response?.data?.data[0];
          setStatus(`${result.STATUS} at ${handleDate(result?.ACTIVATED_TS)}`);
          if (result.STATUS === "PAUSED") {
            setButtonStatus("Activate");
          } else {
            setButtonStatus("De-activate");
          }
          setLoader({ ...loader, activateLoader: false });
        } else {
          setLoader({ ...loader, activateLoader: false });
        }
      } catch (error) {
        setLoader({ ...loader, audienceLoader: false });
        console.error("Error fetching data:", error);
      }
    } else {
      setLoader({ ...loader, activateLoader: true });

      try {
        const response = await API.stopMetaAds(payload);
        if (
          response.status === 200 &&
          response?.data?.data &&
          response?.data?.data?.length > 0
        ) {
          let result = response?.data?.data[0];
          setLoader({ ...loader, activateLoader: false });
          setButtonStatus("Activate");
          setStatus(
            `${result.STATUS} at ${handleDate(result?.DEACTIVATED_TS)}`
          );
        } else {
          setLoader({ ...loader, activateLoader: false });
        }
      } catch (error) {
        setLoader({ ...loader, audienceLoader: false });
        console.error("Error fetching data:", error);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={style}
        className="bg-white bg-opacity-75 backdrop-filter backdrop-blur-lg "
      >
        <div className="text-amaranth-900 text-xl font-bold">Meta Ad's</div>
        <div className="w-full mt-2 pb-21 flex flex-col">
          <label className="block text-sm font-medium leading-6 text-amaranth-600 ">
            Campaign Name
          </label>
          <select
            name="campaign"
            onChange={handleCampaignData}
            value={campaignData?.name}
            required
            className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
          >
            <option value="">Please select</option>
            {campaignList?.map((item) => {
              return <option value={item.name}>{item.name}</option>;
            })}
          </select>
        </div>
        <div className="w-full pb-21 flex flex-col">
          {campaignData?.id !== "" && (
            <span className="text-amaranth-900 text-sm">
              Campaign Id : <strong>{campaignData?.id}</strong>
            </span>
          )}
        </div>
        <div className="mt-4">
          {!loader?.audienceLoader ? (
            <button
              onClick={handleUploadAudience}
              className={
                audienceUploaded
                  ? "bg-gray-400 opacity-1 flex items-center px-4 py-2 text-sm text-white rounded-md"
                  : "bg-amaranth-600 opacity-1 flex items-center px-4 py-2 text-sm text-white rounded-md"
              }
              disabled={audienceUploaded || campaignData?.id === ""}
            >
              Upload Audience
            </button>
          ) : (
            <button className="bg-amaranth-600 opacity-1 flex items-center px-12 py-2 text-sm text-white rounded-md">
              <CircularProgress
                style={{
                  width: "16px",
                  height: "16px",
                  color: "white",
                }}
                title="Wait uploading is going on"
              />
            </button>
          )}
        </div>

        {audienceUploaded && (
          <div className="mt-2">
            {!loader?.activateLoader ? (
              <button
                onClick={() =>
                  handleActivate(
                    buttonStatus === "Activate" ? "Activate" : "De-activate"
                  )
                }
                className="bg-amaranth-600 opacity-1 flex items-center px-4 py-2 text-sm text-white rounded-md"
              >
                {buttonStatus === "Activate" ? "Activate" : "De-activate"}
              </button>
            ) : (
              <button className="bg-amaranth-600 opacity-1 flex items-center px-12 py-2 text-sm text-white rounded-md">
                <CircularProgress
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "white",
                  }}
                  title="Wait uploading is going on"
                />
              </button>
            )}

            <div className="mt-4">
              {status !== "" && (
                <span className="text-amaranth-900 text-sm">
                  Status: <strong>{status}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default ModalForMetaAds;
