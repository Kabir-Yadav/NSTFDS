// src/components/ProjectDetails/AddDataModal.js
import React, { useState } from "react";

const AddDataModal = ({ isOpen, onClose }) => {
  const [formDate, setFormDate] = useState("");
  const [formDeviceCategory, setFormDeviceCategory] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formSerialId, setFormSerialId] = useState("");
  const [formPhoto, setFormPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("date", formDate);
    formData.append("device_category", formDeviceCategory);
    formData.append("status", formStatus);
    formData.append("serial_id", formSerialId);
    if (formPhoto) {
      formData.append("photo", formPhoto);
    }

    try {
      const response = await fetch(
        "https://f72e-106-219-232-23.ngrok-free.app",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }
      const data = await response.json();
      console.log("Data submitted:", data);
      // Reset form
      setFormDate("");
      setFormDeviceCategory("");
      setFormStatus("");
      setFormSerialId("");
      setFormPhoto(null);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Digital Device Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Category
            </label>
            <input
              type="text"
              value={formDeviceCategory}
              onChange={(e) => setFormDeviceCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select status</option>
              <option value="shipped">Shipped</option>
              <option value="just deployed">Just Deployed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial ID
            </label>
            <input
              type="text"
              value={formSerialId}
              onChange={(e) => setFormSerialId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo
            </label>
            <input
              type="file"
              onChange={(e) => setFormPhoto(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded-lg"
              accept="image/*"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDataModal;
