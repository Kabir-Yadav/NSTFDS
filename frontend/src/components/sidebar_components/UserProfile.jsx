import React from "react";

const UserProfile = ({ isOpen, isPsuUser, userPsu, userOrg }) => (
  <div className="flex items-center theme-transition">
    <img
      src={
        isPsuUser
          ? userPsu == "BPCL"
            ? "assets/bpcl.png"
            : userPsu == "IOCL"
            ? "assets/iocl.png"
            : "assets/icon.png"
          : userOrg == "NSTFDC"
          ? "assets/nsfdc_logo.png"
          : "assets/icon.png"
      }
      alt="User Profile"
      className=" h-10 object-cover"
    />
  </div>
);

export default UserProfile;
