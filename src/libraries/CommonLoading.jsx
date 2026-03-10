// src/components/common/CommonLoading.jsx
import React from "react";
import { FiLoader } from "react-icons/fi";

/* ------------------------------------------------------------
   helpers
------------------------------------------------------------ */
const cx = (...cls) => cls.filter(Boolean).join(" ");

/* fullscreen wrapper */
const FullscreenWrap = ({ children, className = "" }) => (
  <div
    className={cx(
      "fixed inset-0 flex items-center justify-center bg-white/80 z-[9999]",
      className
    )}
  >
    {children}
  </div>
);

/* keyframes */
const Keyframes = () => (
  <style>{`
    @keyframes dot-bounce {
      0%, 80%, 100% { transform: scale(0); opacity: .3; }
      40% { transform: scale(1); opacity: 1; }
    }
    @keyframes folding-cube {
      0%, 10% { transform: perspective(140px) rotateX(-180deg); opacity: 0 }
      25%, 75% { transform: perspective(140px) rotateX(0deg); opacity: 1 }
      90%, 100% { transform: perspective(140px) rotateY(180deg); opacity: 0 }
    }
    @keyframes img-pulse {
      0%, 100% { transform: translateZ(0) scale(1); opacity: .95; }
      50% { transform: translateZ(0) scale(1.03); opacity: 1; }
    }
  `}</style>
);

/* tiny util to merge class color vs css color */
const getColorStyle = (color, isBorder = false) => {
  if (!color) return {};
  if (isBorder) {
    // for circle spinner: set border color and transparent top
    return { borderColor: color, borderTopColor: "transparent" };
  }
  return { color };
};
const getBgStyle = (color) => (color ? { backgroundColor: color } : {});

/* ============================================================
   1) Circle Spinner (classic border spinner)
============================================================ */
export const CircleSpinner = ({
  message = "Loading...",
  fullscreen = false,
  size,                 // number (px)
  width,                // number (px)
  height,               // number (px)
  color,                // CSS color string
  colorClass = "text-primary-1",
  thickness = 2,
  angle = 0,
  duration = 0.9,
  className = "",
}) => {
  const w = width ?? size ?? 32;
  const h = height ?? size ?? 32;

  const content = (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <span
        className={cx(
          "inline-block rounded-full border-2 border-current border-t-transparent",
          color ? "" : colorClass // when color provided, we won't rely on text color
        )}
        style={{
          width: w,
          height: h,
          borderWidth: thickness,
          ...getColorStyle(color, true),
          transform: `rotate(${angle}deg)`,
          animation: `spin ${duration}s linear infinite`,
        }}
      />
      {message ? (
        <p className="text-sm text-gray-500 tracking-tight">{message}</p>
      ) : null}
      <style>{`
        @keyframes spin { to { transform: rotate(${360 + angle}deg); } }
      `}</style>
    </div>
  );

  if (fullscreen) return <FullscreenWrap>{content}</FullscreenWrap>;
  return content;
};

/* ============================================================
   2) Icon Spinner (FiLoader)
============================================================ */
export const SpinnerLoading = ({
  message = "Loading...",
  fullscreen = false,
  size = 32,            // px
  color,                // CSS color
  colorClass = "text-primary-1",
  angle = 0,
  duration = 0.9,
  className = "",
}) => {
  const content = (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <FiLoader
        className={cx(color ? "" : colorClass)}
        style={{
          width: size,
          height: size,
          ...getColorStyle(color),
          transform: `rotate(${angle}deg)`,
          animation: `spinIcon ${duration}s linear infinite`,
        }}
      />
      {message ? (
        <p className="text-sm text-gray-500 tracking-tight">{message}</p>
      ) : null}
      <style>{`
        @keyframes spinIcon { to { transform: rotate(${360 + angle}deg); } }
      `}</style>
    </div>
  );

  if (fullscreen) return <FullscreenWrap>{content}</FullscreenWrap>;
  return content;
};

/* ============================================================
   3) Dot Spinner (three bouncing dots)
============================================================ */
export const DotSpinner = ({
  message = "",
  fullscreen = false,
  dotSize = 8,
  color,
  colorClass = "bg-primary-1",
  duration = 1.4,
  gap = 6,
  className = "",
}) => {
  const Dot = (delay) => (
    <span
      className={cx("rounded-full", color ? "" : colorClass)}
      style={{
        width: dotSize,
        height: dotSize,
        ...getBgStyle(color),
        animation: `dot-bounce ${duration}s infinite ease-in-out`,
        animationDelay: delay,
      }}
    />
  );

  const content = (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <Keyframes />
      <div className="flex items-center" style={{ gap }}>
        {Dot("0s")}
        {Dot(".15s")}
        {Dot(".3s")}
      </div>
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );

  if (fullscreen) return <FullscreenWrap>{content}</FullscreenWrap>;
  return content;
};

/* ============================================================
   4) Text Loading (no icon)
============================================================ */
export const TextLoading = ({
  message = "Loading, please wait...",
  fullscreen = false,
  color,
  className = "",
}) => {
  const content = (
    <div
      className={cx("text-sm italic", color ? "" : "text-gray-500", className)}
      style={color ? { color } : undefined}
    >
      {message}
    </div>
  );

  if (fullscreen)
    return (
      <FullscreenWrap>
        <div className="bg-white/70 px-6 py-3 rounded-xl shadow-sm">
          {content}
        </div>
      </FullscreenWrap>
    );
  return content;
};

/* ============================================================
   5) Folding Square (3D-ish cube spinner)
============================================================ */
export const Square3DSpinner = ({
  message = "Loading...",
  fullscreen = false,
  cubeSize = 22,
  color,
  colorClass = "bg-primary-1",
  duration = 2.4,
  gap = 4,
  angle = 0, // initial rotate for whole grid if you like
  className = "",
}) => {
  const Cube = (delay) => (
    <div
      className={cx("inline-block", color ? "" : colorClass)}
      style={{
        width: cubeSize,
        height: cubeSize,
        transformOrigin: "50% 50%",
        animation: `folding-cube ${duration}s infinite linear both`,
        animationDelay: delay,
        ...getBgStyle(color),
      }}
    />
  );

  const content = (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <Keyframes />
      <div
        className="grid grid-cols-2"
        style={{
          gap,
          width: cubeSize * 2 + gap,
          height: cubeSize * 2 + gap,
          transform: `rotate(${angle}deg)`,
        }}
      >
        {Cube("0s")}
        {Cube("0.3s")}
        {Cube("0.6s")}
        {Cube("0.9s")}
      </div>
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );

  if (fullscreen) return <FullscreenWrap>{content}</FullscreenWrap>;
  return content;
};

/* ============================================================
   6) Animated Dots Loading (text + bouncing dots)
============================================================ */
export const DotsLoading = ({
  message = "Fetching data",
  fullscreen = false,
  dotSize = 6,
  color,
  duration = 1.1,
  gap = 4,
  className = "",
}) => {
  const Dot = (delay) => (
    <span
      className="rounded-full"
      style={{
        width: dotSize,
        height: dotSize,
        backgroundColor: color || "#0C213C",
        animation: `bounce ${duration}s infinite`,
        animationDelay: delay,
      }}
    />
  );

  const content = (
    <div className={cx("flex items-center text-sm text-gray-600", className)}>
      <span>{message}</span>
      <span className="inline-flex ml-2" style={{ gap }}>
        {Dot("-0.2s")}
        {Dot("-0.1s")}
        {Dot("0s")}
      </span>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );

  if (fullscreen)
    return (
      <FullscreenWrap>
        <div className="bg-white/80 px-6 py-4 rounded-lg shadow-md">
          {content}
        </div>
      </FullscreenWrap>
    );
  return content;
};

/* ============================================================
   7) Skeleton Block (added color control)
============================================================ */
export const SkeletonBlock = ({
  lines = 3,
  className = "",
  rounded = "rounded-xl",
  barColor = "#F3F4F6",
  titleColor = "#E5E7EB",
}) => {
  return (
    <div className={cx("bg-white p-4 shadow-sm", rounded, className)}>
      <div
        className="h-4 w-32 rounded mb-4 animate-pulse"
        style={{ backgroundColor: titleColor }}
      />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded mb-2 animate-pulse"
          style={{ backgroundColor: barColor, width: i === lines - 1 ? "66%" : "100%" }}
        />
      ))}
    </div>
  );
};

/* ============================================================
   8) Animated Image Loader
============================================================ */
export const ImageLoader = ({
  src,
  alt = "Loading",
  message = "",
  width,
  height,
  size = 72, // used if width/height not provided
  duration = 1.6,
  fullscreen = false,   // included to avoid ReferenceError
  className = "",
}) => {
  const w = width ?? size;
  const h = height ?? size;

  const content = (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <Keyframes />
      <img
        src={src}
        alt={alt}
        style={{
          width: w,
          height: h,
          animation: `img-pulse ${duration}s ease-in-out infinite`,
        }}
        className="object-contain"
      />
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );

  if (fullscreen) return <FullscreenWrap>{content}</FullscreenWrap>;
  return content;
};

/* ============================================================
   9) Square-Path Loader (SVG stroke segment traveling around)
============================================================ */
export const SquarePathLoader = ({
  size = 56,                 // px
  stroke = 4,                // stroke width
  baseColor = "#A3A3A3",     // grey outline
  segmentColor = "#9173DA",  // moving segment
  duration = 1.6,            // seconds
  message = "Fetching details...",
  fullscreen = false,
  className = "",
  bgClass = "",              // e.g., "bg-black" when used fullscreen
  textClass = "text-gray-300",
}) => {
  // SVG viewBox is 0..100. The square is 80x80 inset by 10, so perimeter ≈ 320.
  const dashTotal = 320;
  const segment = 60;  // length of colored segment
  const gap = dashTotal - segment;

  const content = (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <div style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ display: "block" }}
        >
          {/* base stroke */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            fill="none"
            stroke={baseColor}
            strokeWidth={stroke}
            rx="1"
            ry="1"
          />
          {/* animated segment */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            fill="none"
            stroke={segmentColor}
            strokeWidth={stroke}
            rx="1"
            ry="1"
            strokeDasharray={`${segment} ${gap}`}
            strokeDashoffset="0"
            style={{
              animation: `square-path-spin ${duration}s linear infinite`,
            }}
          />
        </svg>
      </div>
      {message ? <p className={cx("text-sm", textClass)}>{message}</p> : null}

      <style>{`
        @keyframes square-path-spin {
          to { stroke-dashoffset: -${dashTotal}; }
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div className={cx("fixed inset-0 z-[9999] flex items-center justify-center", bgClass || "bg-black")}>
        {content}
      </div>
    );
  }
  return content;
};

/* ============================================================
   10) Wireframe 3D Cube Loader (CSS 3D) — no face fill
============================================================ */
export const WireframeCubeLoader = ({
  size = 120,                  // cube face size (px)
  lineColor = "#FFFFFF",       // wireframe stroke (pass from parent)
  faceColor = "transparent",   // no fill by default
  duration = 4.0,              // rotation speed (s)
  angleX = 30,                 // starting angles
  angleY = 35,
  message = "",
  fullscreen = false,
  className = "",
  bgClass = "",                // overlay bg if you use fullscreen; leave blank for none
  textClass = "text-gray-700", // darker text by default now that cube isn't dim
}) => {
  const half = size / 2;

  const content = (
    <div className={cx("flex flex-col items-center gap-4", className)}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          perspective: `${size * 4}px`,
        }}
      >
        <div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: `rotateX(${angleX}deg) rotateY(${angleY}deg)`,
            animation: `cube-rotate ${duration}s linear infinite`,
          }}
        >
          {/* 6 faces (transparent by default) */}
          {[
            { transform: `translateZ(${half}px)` },                // front
            { transform: `rotateY(180deg) translateZ(${half}px)` },// back
            { transform: `rotateY(90deg) translateZ(${half}px)` }, // right
            { transform: `rotateY(-90deg) translateZ(${half}px)` },// left
            { transform: `rotateX(90deg) translateZ(${half}px)` }, // top
            { transform: `rotateX(-90deg) translateZ(${half}px)` },// bottom
          ].map((style, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded"
              style={{
                ...style,
                background: faceColor,                      // transparent by default
                boxShadow: `inset 0 0 0 2px ${lineColor}`,  // wireframe color
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      </div>
      {message ? <p className={cx("text-sm", textClass)}>{message}</p> : null}

      <style>{`
        @keyframes cube-rotate {
          0%   { transform: rotateX(${angleX}deg) rotateY(${angleY}deg); }
          50%  { transform: rotateX(${angleX + 180}deg) rotateY(${angleY + 180}deg); }
          100% { transform: rotateX(${angleX + 360}deg) rotateY(${angleY + 360}deg); }
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div className={cx("fixed inset-0 z-[9999] flex items-center justify-center", bgClass)}>
        {content}
      </div>
    );
  }
  return content;
};
