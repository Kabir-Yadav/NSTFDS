import React from "react";

const UserProfile = ({ user }) => (
  <div className="flex items-center p-4 border-b border-[var(--color-border)] space-x-4 theme-transition">
    <img
      src={user.image}
      alt="User Profile"
      className="w-10 h-10 rounded-full object-cover"
    />
    <span className="font-redhat text-[var(--color-text)] font-medium">
      {user.name}
    </span>
  </div>
);

export default UserProfile;
