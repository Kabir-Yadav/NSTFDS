import React, { useState } from "react";

const DeviceForm = ({ isOpen, onClose }) => {
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
    <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative">
        <h2 className="text-3xl font-display font-semibold text-gray-900 mb-6">
          Add Digital Device Data
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Category
            </label>
            <input
              type="text"
              value={formDeviceCategory}
              onChange={(e) => setFormDeviceCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select status</option>
              <option value="shipped">Shipped</option>
              <option value="just deployed">Just Deployed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial ID
            </label>
            <input
              type="text"
              value={formSerialId}
              onChange={(e) => setFormSerialId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <input
              type="file"
              onChange={(e) => setFormPhoto(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              accept="image/*"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceForm;
