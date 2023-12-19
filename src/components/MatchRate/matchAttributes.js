import React, { useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Grid } from "@mui/material";

const MatchAttributes = ({ formData, setFormData, matchAttributesList }) => {
  const [matchAttributeTag, setMatchAttributeTag] = useState("");

  const [selectedRadios, setSelectedRadios] = useState({});

  const handleMultiSelect = (event) => {
    if (event.target.value !== "overall") {
      setMatchAttributeTag(
        matchAttributesList?.filter(
          (obj) => obj.MATCH_ATTRIBUTES === event.target.value
        )?.[0]
      );
    } else {
      setMatchAttributeTag({ MATCH_ATTRIBUTES: "overall" });
      setFormData({
        ...formData,
        Match_Attribute: { overall: "overall" },
        Match_Attribute_Value: {},
      });
      setSelectedRadios({});
    }
  };

  const handleRadioButtons = (event, name) => {
    const { name: inputName, value } = event.target;
    const updatedSelectedRadios = { ...selectedRadios };

    if (updatedSelectedRadios[name]) {
      updatedSelectedRadios[name][inputName] = value;
    } else {
      updatedSelectedRadios[name] = { [inputName]: value };
    }
    setSelectedRadios(updatedSelectedRadios);

    const finalObj = {
      ...formData.Match_Attribute_Value,
      [name]: updatedSelectedRadios[name],
    };

    let transformedObject = {};

    for (const key in finalObj) {
      if (Object.hasOwnProperty?.call(finalObj, key)) {
        if (
          finalObj[key]?.hasOwnProperty("from") &&
          finalObj[key]?.hasOwnProperty("to")
        ) {
          transformedObject[
            key
          ] = `${finalObj[key]?.from} and ${finalObj[key]?.to}`;
        } else {
          transformedObject[key] = finalObj[key][key];
        }
      }
    }
    transformedObject = Object.fromEntries(
      Object.entries(transformedObject).filter(
        ([key, value]) => value !== undefined
      )
    );

    setFormData({
      ...formData,
      Match_Attribute: transformedObject,
      Match_Attribute_Value: finalObj,
    });
  };

  return (
    <div className="flex flex-col font-medium leading-6 text-amaranth-600">
      <label className="block text-sm font-medium leading-6 text-amaranth-600 ">Match attribute</label>
      <select
        name="Match_Attribute_Value"
        onChange={handleMultiSelect}
        required
        value={matchAttributeTag?.MATCH_ATTRIBUTES || "Overall"}
        className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
      >
        <option value="">Please select</option>
        <option value="overall">Overall</option>
        {matchAttributesList?.map((item, index) => {
          return (
            <option value={item.MATCH_ATTRIBUTES} key={index}>
              {item.MATCH_ATTRIBUTES}
            </option>
          );
        })}
      </select>

      {matchAttributeTag?.TAG === "user_input" && (
        <div className="my-2 pb-21 flex flex-col">
          {matchAttributeTag?.MATCH_ATTRIBUTES !== "" && (
            <span className="my-2 pb-21">
              Select {matchAttributeTag?.MATCH_ATTRIBUTES}
            </span>
          )}
          <div className="grid grid-cols-2 gap-4">
            <label className="pr-2">From</label>
            <label className="pr-2">To</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              name="from"
              onChange={(event) =>
                handleRadioButtons(event, matchAttributeTag?.MATCH_ATTRIBUTES)
              }
              required
              value={
                selectedRadios?.[matchAttributeTag?.MATCH_ATTRIBUTES]?.from ||
                ""
              }
              className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
            >
              <option value="">Please select</option>
              {matchAttributeTag?.MATCH_VALUES?.split(",")?.map(
                (item, index) => {
                  return (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  );
                }
              )}
            </select>
            <select
              name="to"
              onChange={(event) =>
                handleRadioButtons(event, matchAttributeTag?.MATCH_ATTRIBUTES)
              }
              required
              value={
                selectedRadios?.[matchAttributeTag?.MATCH_ATTRIBUTES]?.to || ""
              }
              className="bg-transparent  block w-full rounded-md border-0 py-1.5 text-amaranth-600  bg-blend-darken    shadow-sm ring-1 ring-inset ring-amaranth-600  placeholder:text-amaranth-600  focus:ring-2 focus:ring-inset focus:ring-amaranth-600  sm:text-sm sm:leading-6"
            >
              <option value="">Please select</option>
              {matchAttributeTag?.MATCH_VALUES?.split(",")?.map(
                (item, index) => {
                  return (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  );
                }
              )}
            </select>
          </div>
        </div>
      )}
      {matchAttributeTag?.TAG === "option" && (
        <RadioGroup
          aria-label={matchAttributeTag?.MATCH_ATTRIBUTES}
          name={matchAttributeTag?.MATCH_ATTRIBUTES}
          value={
            selectedRadios?.[matchAttributeTag?.MATCH_ATTRIBUTES]?.[
              matchAttributeTag?.MATCH_ATTRIBUTES
            ]
          }
          onChange={(event) =>
            handleRadioButtons(event, matchAttributeTag?.MATCH_ATTRIBUTES)
          }
        >
          <div className="my-2 pb-21 flex flex-col">
            {matchAttributeTag?.MATCH_ATTRIBUTES !== "" && (
              <span className="my-2 pb-21">
                Select {matchAttributeTag?.MATCH_ATTRIBUTES}
              </span>
            )}
            <Grid container spacing={1} className="pl-4">
              {matchAttributeTag?.MATCH_VALUES?.split(",")?.map(
                (values, idx) => {
                  // const label =
                  //   values?.charAt(0).toUpperCase() + values?.slice(1);
                  return (
                    <Grid item xs={4} key={idx}>
                      <FormControlLabel
                        value={values}
                        control={<Radio />}
                        label={
                          values === "m"
                            ? "Male"
                            : values === "f"
                            ? "Female"
                            : values
                        }
                      />
                    </Grid>
                  );
                }
              )}
            </Grid>
          </div>
        </RadioGroup>
      )}
    </div>
  );
};

export default MatchAttributes;
