import React, { useState } from "react";
import TrainingForm from "./forms/training-form";
import DeviceForm from "./forms/device-form";
import SanitaryPadForm from "./forms/sanitary-form";
import SelectionForm from "./SelectionForm2";

const AdminSelectionForm = ({ selectedProject, data, categories }) => {
  const [showAddDataModal, setShowAddDataModal] = useState(false);

  const handleCloseModal = () => {
    setShowAddDataModal(false); // Close the modal
  };

  const renderForms = () => {
    if (selectedProject?.name === "Residential Training Project for EMRS Teachers") {
      return (
        <TrainingForm
          isOpen={showAddDataModal}
          onClose={handleCloseModal} // Pass the close handler
        />
      );
    }

    if (selectedProject?.name === "Digital Device Procurement") {
      return (
        <DeviceForm
          isOpen={showAddDataModal}
          categories={categories}
          data={data}
          onClose={handleCloseModal} // Pass the close handler
        />
      );
    }

    if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
      return (
        <SanitaryPadForm
          isOpen={showAddDataModal}
          data={data}
          onClose={handleCloseModal} // Pass the close handler
        />
      );
    }

    return null;
  };

  return (
    <>
      <div>
        {[
          "Digital Device Procurement",
          "Sanitary Pad Devices Procurement",
        ].includes(selectedProject?.name) && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddDataModal(true)}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg 
                       transition-colors font-redhat
                       flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span>Add Data</span>
            </button>
          </div>
        )}
        {renderForms()}
      </div>
      <SelectionForm
        selectedProject={selectedProject}
        data={data}
        categories={categories}
      />
    </>
  );
};

export default AdminSelectionForm;
