import type { ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const data = [
  {
    name: "Jan",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
  {
    name: "Feb",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
  {
    name: "March",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
  {
    name: "Apr",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
  {
    name: "May",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
  {
    name: "June",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
  {
    name: "July",
    actualMargin: randomIntFromInterval(1000, 5000),
    pricedMargin: randomIntFromInterval(1000, 5000),
  },
];

type PayloadItem = {
  name?: string;
  actualMargin?: number;
};

type Payload = {
  color?: string;
  unit?: ReactNode;
  dataKey?: string | number;
  payload?: PayloadItem;
  chartType?: string;
  stroke?: string;
  strokeDasharray?: string | number;
  strokeWidth?: number | string;
  value: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Payload[];
  label?: string;
}) => {
  if (
    active &&
    payload &&
    payload.length &&
    payload[0] &&
    payload[1] &&
    label
  ) {
    return (
      <div className="border-2 border-gray-300 bg-gray-100 bg-opacity-40 p-2 text-sm">
        <p>{`${label}`}</p>
        <p className="font-light text-[#8884d8]">{`Actual Margin : RM ${payload[0].value}`}</p>
        <p className="font-light text-[#82ca9d]">{`Priced Margin: RM ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const ProjectInformation = () => {
  return (
    <div className="m-4 rounded-xl bg-blue-100/10">
      <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4  px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-x-3">
            <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h1 className="flex gap-x-3 text-base leading-7">
              <span className="font-semibold text-black">
                Project Information
              </span>
            </h1>
          </div>
          <p className="text-xs leading-6 text-gray-400">
            Stats and information during construction
          </p>
        </div>
        <div className="order-first flex-none rounded-lg bg-blue-400/10 px-4 py-2 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30 hover:cursor-pointer sm:order-none">
          Update
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 px-2 py-2 sm:grid-cols-2 lg:grid-cols-2 xl:gap-x-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            width={600}
            height={300}
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <Line type="monotone" dataKey="actualMargin" stroke="#8884d8" />
            <Line type="monotone" dataKey="pricedMargin" stroke="#82ca9d" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            width={600}
            height={300}
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <Line type="monotone" dataKey="actualMargin" stroke="#8884d8" />
            <Line type="monotone" dataKey="pricedMargin" stroke="#82ca9d" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectInformation;
