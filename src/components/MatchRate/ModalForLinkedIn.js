import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Modal } from "@mui/material";
import { useSelector } from "react-redux";
import API from "../../apiServices/api";
import { handleDate } from "../../utils/commonFunctions";

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

const ModalForLinkedIn = ({ open, handleClose, data }) => {
  const [campaignGroup, setCampaignGroup] = useState([]);
  const [campaignList, setCampaignList] = useState([]);
  const [creativeAds, setCreativeAds] = useState([]);

  const [selectedCampaignGroupId, setSelectedCampaignGroupId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCreativeAdId, setSelectedCreativeAdId] = useState("");

  const [campaignData, setCampaignData] = useState("");
  const [campaignData1, setCampaignData1] = useState({});

  const [status, setStatus] = useState("");
  const [audienceUploaded, setAudienceUploaded] = useState(false);
  const [buttonStatus, setButtonStatus] = useState("Activate");

  const [errorMessage, setErrorMessage] = useState('');

  const [loader, setLoader] = useState({
    audienceLoader: false,
    activateLoader: false,
  });

  const state = useSelector((state) => state);
  const user = state?.user;

  const handleCampaignGroup = (event) => {
    const selectedObject = campaignGroup.find(
      (item) => item.name === event.target.value
    );
    setCampaignData(selectedObject);
    setSelectedCampaignGroupId(selectedObject.id);
  };

  const handleCampaign = (event) => {
    const selectedObject = campaignList.find(
      (item) => item.name === event.target.value
    );
    setCampaignData1(selectedObject);
    setSelectedCampaignId(selectedObject.id);
    setSelectedCreativeAdId("");
  };

  const handleCreativeAd = (event) => {
    setSelectedCreativeAdId(event.target.value);
  };

  //useEffect for CampaignGroup
  useEffect(() => {
    if (selectedCampaignGroupId === "") {
      const campaignGroupList = async () => {
        const payload = {
          account_name: user?.Consumer,
         // run_id: data?.runId,
        };
        try {
          const response = await API.fetchingLinkedinCampaignGroups(payload);
          if (response?.status === 200 && response?.data?.data) {
            setCampaignGroup(response?.data?.data);
          }
        } catch (error) {
          console.log(error);
        }
      };
      campaignGroupList();
    }
  }, [user?.Consumer, data?.runId, selectedCampaignGroupId]);

  //useEffect for CampaignList
  useEffect(() => {
    if (selectedCampaignGroupId !== "") {
      const campaignListFun = async () => {
        const payload = {
          account_name: user?.Consumer,
          campaign_group_id: selectedCampaignGroupId,
        };
        try {
          const response = await API.fetchingLinkedinCampaign(payload);
          if (response.status === 200 && response?.data?.data) {
            setCampaignList([response.data.data]);
          }
        } catch (error) {
          console.log(error);
        }
      };
      campaignListFun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaignGroupId, user?.Consumer]);

  //useEffect for Campaign Ad's
  useEffect(() => {
    if (selectedCampaignId !== "") {
      const campaignAdFun = async () => {
        const payload = {
          account_name: user?.Consumer,
          campaign_id: selectedCampaignId,
        };
        try {
          const response = await API.fetchingLinkedinCreativeAd(payload);
          if (response.status === 200 && response?.data) {
            setCreativeAds([response?.data]);
          } else {
            console.log("No creative ads available for this campaign.");
          }
        } catch (error) {
          console.log("Error fetching creative ads:", error);
        }
      };
      campaignAdFun();
    }
  }, [selectedCampaignId, user?.Consumer]);

  // Handle upload Audience 
  const handleUploadAudience = async () => {
    setLoader({ ...loader, audienceLoader: true });
    const payload = {
      account_name: user?.Consumer,
      run_id: data?.runId,
      templateName: data?.template_name,
      linkedin_account_name: user?.Consumer,
      consumer_database_name: "DCR_SAMP_CONSUMER1",
    };
    try {
      const response = await API.uploadLinkedinAudience(payload);
      if (
        response.status === 200 &&
        response?.data?.data &&
        response?.data?.data.length > 0
      ) {
        const result = response?.data?.data[0];
        setStatus(`${result.STATUS} at ${handleDate(result?.UPLOAD_TS)}`);
        setLoader({ ...loader, audienceLoader: false });
        setAudienceUploaded(true);
        console.log("upload Succesfull");
      } else {
        setLoader({ ...loader, audienceLoader: false });
        console.log("error: in Uploading");
        const errorMessage = response?.data?.error || "Unknown error";
        console.log("Error in Uploading:", errorMessage);
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setLoader({ ...loader, audienceLoader: false });
      console.error("Error fetching data:", error);
    }
  };


  // Handle Activate DeActivate
  const handleActivate = async (status) => {
    const payload = {
      account_name: user?.Consumer,
      run_id: data?.runId,
      campaign_id: selectedCampaignId,
    };

    if (status === "Activate") {
      setLoader({ ...loader, activateLoader: true });
      try {
        const response = await API.activateLinkedinCampaign(payload);
        if (
          response.status === 200 &&
          response?.data?.data &&
          response?.data?.data.length > 0
        ) {
          const result = response?.data?.data[0];
          setStatus(`${result.STATUS} at ${handleDate(result?.ACTIVATED_TS)}`);
          setButtonStatus("De-activate");
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
        const response = await API.deActivateLinkedinCampaign(payload);
        if (
          response.status === 200 &&
          response?.data?.data &&
          response?.data?.data.length > 0
        ) {
          const result = response?.data?.data[0];
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
        className="bg-white bg-opacity-75 backdrop-filter backdrop-blur-lg"
      >
        <div className="text-amaranth-900 text-xl font-bold">LinkedIn Ad's</div>
        <div className="w-full mt-2 pb-21 flex flex-col">
          <label className="block text-sm font-medium leading-6 text-amaranth-600">
            Campaign Group
          </label>
          <select
            name="campaignGroup"
            onChange={handleCampaignGroup}
            value={campaignData.name}
            required
            className="bg-transparent block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
          >
            <option value="">Please select</option>
            {campaignGroup.map((item) => (
              <option value={item.name} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {selectedCampaignGroupId !== "" && (
            <div className="w-full pb-21 flex flex-col">
              <span className="text-amaranth-900 text-sm">
                CampaignGroup-Id: <strong>{selectedCampaignGroupId}</strong>
              </span>
            </div>
          )}
        </div>
        <label className="block text-sm font-medium leading-6 text-amaranth-600">
          Campaign
        </label>
        <select
          name="campaign"
          onChange={handleCampaign}
          value={campaignData1.name}
          required
          className="bg-transparent block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
        >
          <option value="">Please select</option>
          {campaignList && campaignList.length > 0 ? (
            campaignList.map((item) => (
              <option value={item.name} key={item.id}>
                {item.name}
              </option>
            ))
          ) : (
            <option value="">No campaigns available</option>
          )}
        </select>
        {selectedCampaignId && (
          <div className="w-full pb-21 flex flex-col">
            <span className="text-amaranth-900 text-sm">
              Campaign Id: <strong>{selectedCampaignId}</strong>
            </span>
          </div>
        )}
        <label className="block text-sm font-medium leading-6 text-amaranth-600">
          Ad's
        </label>
        <select
          name="Ads"
          onChange={handleCreativeAd}
          value={selectedCreativeAdId}
          required
          className="bg-transparent block w-full rounded-md border-0 py-1.5 text-amaranth-600 bg-blend-darken shadow-sm ring-1 ring-inset ring-amaranth-600 placeholder:text-amaranth-600 focus:ring-2 focus:ring-inset focus:ring-amaranth-600 sm:text-sm sm:leading-6"
        >

          <option value="">Please select</option>
          {creativeAds.map((item, index) => (
            <option value={item.data} key={index}>
              {item.data}
            </option>))}
        </select>
        {selectedCreativeAdId && (
          <div className="w-full pb-21 flex flex-col">
            <span className="text-amaranth-900 text-sm">
              Ads: <strong>{selectedCreativeAdId}</strong>
            </span>
          </div>
        )}

        <div className="mt-4">
          {!loader.audienceLoader ? (
            <button
              onClick={handleUploadAudience}
              className={
                audienceUploaded
                  ? "bg-gray-400 opacity-1 flex items-center px-4 py-2 text-sm text-white rounded-md"
                  : "bg-amaranth-600 opacity-1 flex items-center px-4 py-2 text-sm text-white rounded-md"
              }
              disabled={audienceUploaded || campaignData.id === ""}
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

          {/* Display error message */}
          {errorMessage && (
            <div className="mt-2 text-red-500 text-sm">
              Error: {errorMessage}
            </div>
          )}
        </div>

        {audienceUploaded && (
          <div className="mt-2">
            {!loader.activateLoader ? (
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

export default ModalForLinkedIn;
