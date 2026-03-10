// src/components/common/CommonCard.jsx
import React, { useRef, useState, useEffect } from "react";

const TableGridCard = ({ OverView }) => {
  return (
    <div className={`flex space-x-2 justify-end`}>
      {OverView?.map((stat, index) => (
        <div
          key={index}
          className={`px-2 py-2 pt-3 rounded-2xl shadow-md bg-page-bg flex items-center justify-between w-36
                }`}
        >
          <div className="w-full">
            <h4
              className={`text-xs sm:text-base font-bold rounded-md p-1 px-2 w-full ${stat.bgColor} ${stat.textColor}`}
            >
              {stat.title}
            </h4>
            <p
              className={`text-sm md:text-base lg:text-lg ${stat.priceColour} text-right  mt-2`}
            >
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export {
  TableGridCard,
};
