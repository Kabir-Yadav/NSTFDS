import React from "react";

const UserProfile = ({ user, isOpen }) => (
  <div className="flex items-center theme-transition">
    <img
      src={user.image}
      alt="User Profile"
      className=" h-10 rounded-full object-cover"
    />
    <span className="font-redhat text-[var(--color-text)] font-normal text-sm">
      {user.name}
    </span>
  </div>
);

export default UserProfile;
