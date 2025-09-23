import React from "react";

const UserProfile = ({ isOpen }) => (
  <div className="flex items-center theme-transition">
    <img
      src={'assets/icon.png'}
      alt="User Profile"
      className=" h-10 rounded-full object-cover"
    />
    
  </div>
);

export default UserProfile;
