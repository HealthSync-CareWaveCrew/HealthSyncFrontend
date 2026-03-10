import React, { useEffect, useRef, useState } from "react";

const DEFAULT_HEIGHT = "h-[34px]";
const injectSlowSpin = () => {
  if (typeof document === "undefined") return;
  const id = "btn-anim-spin-slow";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 3s linear infinite;
    }
  `;
  document.head.appendChild(style);
};
injectSlowSpin();
const BaseButton = ({
  as = "button",
  children = "Button",
  size = "md",
  width = "min",
  fullWidth = false,
  height = DEFAULT_HEIGHT,
  borderRadius = "rounded-lg",
  fontSize = "text-sm",
  variant = "solid", // solid | outline
  className = "",
  iconLeft = null,
  iconRight = null,
  imageLeft = null,
  imageRight = null,
  imageClassName = "h-5 w-5 object-contain",
  ...rest
}) => {
  const Comp = as;

  const sizeClasses = {
    sm: "px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2",
    md: "px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5",
    lg: "px-5 xs:px-6 sm:px-7 py-2.5 xs:py-3",
  }[size] || "px-4 py-2";

  const widthClasses = fullWidth
    ? "w-full"
    : width === "min"
      ? "min-w-[90px] xs:min-w-[100px] sm:min-w-[120px]"
      : typeof width === "string"
        ? width
        : "";

  // ⭐ Variant Classes
  const variantClasses =
    variant === "outline"
      ? "border border-primary-1 text-primary-1 bg-transparent hover:bg-primary-1/10"
      : "bg-primary-1 text-white hover:bg-primary-1/90";

  return (
    <Comp
      className={`
        inline-flex items-center justify-center gap-1.5 xs:gap-2
        ${borderRadius} ${fontSize} font-medium transition-all
        active:scale-[.985]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-1
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-sm
        ${variantClasses}
        ${height} ${sizeClasses} ${widthClasses}
        ${className}
      `.trim()}
      {...rest}
    >
      {imageLeft ? (
        <img src={imageLeft} alt="" className={`inline-block ${imageClassName}`} />
      ) : (
        iconLeft && <span className="inline-flex">{iconLeft}</span>
      )}

      {children && <span className="whitespace-nowrap">{children}</span>}

      {imageRight ? (
        <img src={imageRight} alt="" className={`inline-block ${imageClassName}`} />
      ) : (
        iconRight && <span className="inline-flex">{iconRight}</span>
      )}
    </Comp>
  );
};

const GhostButton = ({
  children = "Ghost",
  color = "primary",        // primary | gray | danger | success
  outline = true,           // toggle border on/off
  height = DEFAULT_HEIGHT,
  borderRadius = "rounded-md",
  fontSize = "text-sm",
  className = "",
  iconLeft,
  iconRight,
  imageLeft,
  imageRight,
  width,
  fullWidth,
  ...rest
}) => {
  const palette = {
    primary: {
      text: "!text-primary-1",
      border: "border-primary-1/70",
      hover: "hover:!bg-primary-1/10",
      active: "active:!bg-primary-1/15",
    },
    gray: {
      text: "!text-gray-700",
      border: "border-gray-300",
      hover: "hover:!bg-gray-100",
      active: "active:!bg-gray-200",
    },
    danger: {
      text: "!text-red-600",
      border: "border-red-300",
      hover: "hover:!bg-red-50",
      active: "active:!bg-red-100",
    },
    success: {
      text: "!text-green-600",
      border: "border-green-300",
      hover: "hover:!bg-green-50",
      active: "active:!bg-green-100",
    },
  }[color] || {};

  return (
    <BaseButton
      height={height}
      borderRadius={borderRadius}
      fontSize={fontSize}
      iconLeft={iconLeft}
      iconRight={iconRight}
      imageLeft={imageLeft}
      imageRight={imageRight}
      width={width}
      fullWidth={fullWidth}
      className={`
        !bg-transparent !shadow-none
        ${palette.text || "!text-primary-1"}
        ${outline ? `border ${palette.border || "border-primary-1/70"}` : "border-0"}
        ${palette.hover || "hover:!bg-primary-1/10"}
        ${palette.active || "active:!bg-primary-1/15"}
        ${className}
      `.trim()}
      {...rest}
    >
      {children}
    </BaseButton>
  );
};

export {
  BaseButton as Button,
  BaseButton,
  GhostButton,
};
