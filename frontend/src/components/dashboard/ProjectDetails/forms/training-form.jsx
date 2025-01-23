import React, { useState } from "react";

const TrainingForm = ({
  isOpen,
  onClose,
  states = [
    "Rajasthan",
    "Gujarat",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
  ],
  districts = {
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh"],
    "Uttar Pradesh": ["Lucknow", "Varanasi", "Kanpur"],
    "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
  },
  schools = {
    Jaipur: ["Government School Jaipur", "Modern Public School"],
    Ahmedabad: ["City High School", "Rural Education Center"],
  },
}) => {
  const [formData, setFormData] = useState({
    state: "",
    district: "",
    school: "",
    grade: "",
    module: "",
    photo: null,
  });

  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      district: "",
      school: "",
    }));
    setSelectedDistricts(districts[selectedState] || []);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
      school: "",
    }));
    setSelectedSchools(schools[selectedDistrict] || []);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitData.append(key, value);
    });

    try {
      const response = await fetch(
        "https://f72e-106-219-232-23.ngrok-free.app",
        {
          method: "POST",
          body: submitData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit data");

      const data = await response.json();
      console.log("Data submitted:", data);

      // Reset form
      setFormData({
        state: "",
        district: "",
        school: "",
        grade: "",
        module: "",
        photo: null,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative">
        <div
          className="absolute top-0 left-0 right-0 h-[40%] bg-cover bg-center opacity-20 z-[-1]"
          style={{
            backgroundImage: "url(/background.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <h2 className="text-3xl font-display font-semibold text-gray-900 mb-6">
          Add Training Data
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleDistrictChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!formData.state}
                required
              >
                <option value="">Select district</option>
                {selectedDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name
            </label>
            <select
              name="school"
              value={formData.school}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!formData.district}
              required
            >
              <option value="">Select school</option>
              {selectedSchools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select grade</option>
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
              ].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module
            </label>
            <select
              name="module"
              value={formData.module}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select module</option>
              {["Module 1", "Module 2", "Module 3", "Module 4"].map(
                (module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <input
              type="file"
              name="photo"
              onChange={handleInputChange}
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

export default TrainingForm;
