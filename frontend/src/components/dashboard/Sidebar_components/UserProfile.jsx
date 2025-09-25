import React from "react";

const UserProfile = ({ isOpen, isPsuUser, userPsu }) => (
  <div className="flex items-center theme-transition">
    <img
      src={
        isPsuUser
          ? userPsu == "BPCL"
            ? "assets/bpcl.png"
            : "assets/icon.png"
          : "assets/icon.png"
      }
      alt="User Profile"
      className=" h-10 object-cover"
    />
  </div>
);

export default UserProfile;
