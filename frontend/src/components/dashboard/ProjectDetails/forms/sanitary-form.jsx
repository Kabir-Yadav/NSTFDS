import React, { useState } from "react";

const SanitaryPadForm = ({ isOpen, onClose }) => {
  const states = {
    "Andhra Pradesh": ["Alluri Sitharama Raju", "Anantapur", "Chittoor"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
  };

  const statusOptions = ["Delivered", "Installed", "In Progress", "Pending"];

  const [formData, setFormData] = useState({
    state_name: "",
    district_name: "",
    school_name: "",
    cost: "",
    status: "",
    delivery_date: "",
    proof_image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      ...(name === "state_name" ? { district_name: "" } : {}), // reset district if state changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    try {
      const response = await fetch("http://localhost:8000/sanitary-pad-procurements/", {
        method: "POST",
        body: data,
      });

      if (!response.ok) throw new Error("Failed to submit form");

      const result = await response.json();
      console.log("Success:", result);
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  if (!isOpen) return null;

  const selectedDistricts = states[formData.state_name] || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Sanitary Pad Procurement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* State Dropdown */}
          <div>
            <label className="block mb-1">State</label>
            <select
              name="state_name"
              value={formData.state_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            >
              <option value="">Select state</option>
              {Object.keys(states).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block mb-1">District</label>
            <select
              name="district_name"
              value={formData.district_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
              disabled={!formData.state_name}
            >
              <option value="">Select district</option>
              {selectedDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* School Name */}
          <div>
            <label className="block mb-1">School Name</label>
            <input
              type="text"
              name="school_name"
              value={formData.school_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block mb-1">Cost (₹)</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            >
              <option value="">Select status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block mb-1">Delivery Date</label>
            <input
              type="date"
              name="delivery_date"
              value={formData.delivery_date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Proof Image Upload */}
          <div>
            <label className="block mb-1">Proof Image</label>
            <input
              type="file"
              name="proof_image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SanitaryPadForm;
