import React from "react";

const DashboardBackground1 = () => {
  return (
    <div
      style={{
        zindex: "-99",
        top: "auto",
        bottom: "10%",
        width: "350px",
        height: "450px",
        right: "auto",
        WebkitFilter: "blur(200px)",
        filter: "blur(200px)",
        backgroundColor: "rgba(var(--color-primary-rgb), 0.12)",
        position: "absolute",
      }}
    />
  );
};
const DashboardBackground2 = () => {
  return (
    <div
      style={{
        zindex: "-99",
        top: "13%",
        bottom: "auto",
        left: "auto",
        right: "0%",
        width: "300px",
        height: "300px",
        WebkitFilter: "blur(200px)",
        filter: "blur(200px)",
        backgroundColor: "rgba(var(--color-primary-rgb), 0.15)",
        position: "absolute",
      }}
    />
  );
};

export { DashboardBackground1, DashboardBackground2 };
