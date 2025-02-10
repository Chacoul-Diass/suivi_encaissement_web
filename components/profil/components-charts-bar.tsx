"use client";
import PanelCodeHighlight from "@/components/panel-code-highlight";

import ReactApexChart from "react-apexcharts";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ComponentsChartsBar = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // barChartOptions
  const barChart: any = {
    series: [
      {
        name: "Sales",
        data: [44, 55, 41, 67, 22, 43, 21, 70],
      },
    ],
    options: {
      chart: {
        height: 300,
        type: "bar",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
      },
      colors: ["#4361ee"],
      xaxis: {
        categories: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
        axisBorder: {
          color: "#e0e6ed",
        },
      },
      yaxis: {
        opposite: false,
        reversed: false,
      },
      grid: {
        borderColor: "#e0e6ed",
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      fill: {
        opacity: 0.8,
      },
    },
  };
  return (
    <PanelCodeHighlight
      title="Simple Bar"
      codeHighlight={`import ReactApexChart from 'react-apexcharts';

{isMounted && <ReactApexChart series={barChart.series} options={barChart.options} className="rounded-lg bg-white dark:bg-black" type="bar" height={300} width={'100%'} />}

// barChartOptions
const barChart: any = {
    series: [
        {
            name: 'Sales',
            data: [44, 55, 41, 67, 22, 43, 21, 70],
        },
    ],
    options: {
        chart: {
            height: 300,
            type: 'bar',
            zoom: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 1,
        },
        colors: ['#4361ee'],
        xaxis: {
            categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            axisBorder: {
                color: isDark ? '#191e3a' : '#e0e6ed',
            },
        },
        yaxis: {
            opposite: isRtl ? true : false,
            reversed: isRtl ? true : false,
        },
        grid: {
            borderColor: isDark ? '#191e3a' : '#e0e6ed',
        },
        plotOptions: {
            bar: {
                horizontal: true,
            },
        },
        fill: {
            opacity: 0.8,
        },
    },
};`}
    >
      <div className="mb-5">
        {isMounted && (
          <ReactApexChart
            series={barChart.series}
            options={barChart.options}
            className="rounded-lg bg-white dark:bg-black"
            type="bar"
            height={300}
            width={"100%"}
          />
        )}
      </div>
    </PanelCodeHighlight>
  );
};

export default ComponentsChartsBar;
