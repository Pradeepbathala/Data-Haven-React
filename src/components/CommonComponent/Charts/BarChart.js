import React from "react";
import {
  Bar,
  BarChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ["#3700FF", "#FB13F3", "#FB0007", "#FED60A", "#44FF07"];

const BarChartAnalytics = ({ data }) => {
  const getPath = (x, y, width, height) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${
      x + width / 2
    },${y + height / 3}
    ${x + width / 2}, ${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
      x + width
    }, ${y + height}
    Z`;
  };

  const TriangleBar = (props) => {
    const { fill, x, y, width, height } = props;

    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };

  return (
    <div className="w-full max-w-full px-3 sm:flex-0 shrink-0 sm:w-6/12 lg:w-full">
      <div className="border-black/12.5 shadow-soft-xl dark:bg-gray-950 dark:shadow-soft-dark-xl relative mt-6 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
          <div className="p-4 pb-0 rounded-t-4">
              <h5 className="mb-0 dark:text-white text-amaranth-700">Bar Chart</h5>
          </div>
          <div className="flex flex-row p-4">
          <BarChart
          width={520}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 10,
            bottom: 44,
            left: 40,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#056433" stopOpacity={1} />
              <stop offset="100%" stopColor="#056433" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="#fff"
            tick={{ fill: "#615E83", fontSize: "0.7rem", fontFamily: "Inter" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDataOverflow={false}
            tick={{ fill: "#615E83", fontSize: "0.8rem", fontFamily: "Inter" }}
          />
          {/* <Tooltip /> */}
          <Tooltip
            cursor={false}
            content={
              <CustomTooltip labelClassName={""} wrapperClassName={""} />
            }
          />

          {/* <Legend wrapperStyle={{ color: "black" }} /> */}
          <Bar
            dataKey="value"
            fill="#8884d8"
            shape={<TriangleBar />}
            label={{ position: "top" }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % 20]} />
            ))}
          </Bar>
          {/* <Bar
            dataKey="value"
            fillOpacity={1}
            fill="#E91F64"
            radius={4}
            background={{ fill: "rgba(5, 100, 51, 0.05)", radius: 5 }}
          ></Bar> */}
        </BarChart>
        </div>
        </div>
        </div>
   );
};

export default BarChartAnalytics;

const CustomTooltip = ({
  active,
  payload,
  label,
  labelClassName,
  wrapperClassName,
}) => {
  if (active) {
    return (
      <div
        className="shadow rounded"
        style={{ background: "rgba(30, 30, 30, 0.8)" }}
      >
        <div
          className="px-4 py-1"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            borderBottom: "1px solid #333",
          }}
        >
          <p className="label text-xs roboto-medium text-white">
            {(payload && payload.length > 0 && payload[0].payload?.name) ||
              label}
          </p>
        </div>
        <div className="desc px-4 py-1 text-center">
          {payload?.map((p, index) => (
            <div key={`${index}_${p.name}`} className={"text-xs text-white"}>
              {labelClassName !== "undefined" ? labelClassName : ""}
              {labelClassName === undefined && wrapperClassName === undefined
                ? Number.isInteger(p.value) === false
                  ? p.value || 0
                  : p.value || 0
                : p.value || 0}
              {wrapperClassName !== "undefined" ? wrapperClassName : ""}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};