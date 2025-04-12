import React, { useState } from "react";
import AddDataModal from "./AddDataModel";
import DeviceProcurementTable from "./tables/Device-Procurement-Table";
import TrainingForm from "./forms/training-form";
import DeviceForm from "./forms/device-form";
import SanitaryPadForm from "./forms/sanitary-form";
import SanitaryPadTable from "./tables/sanitary-pad-table";
import SelectionForm from "./SelectionForm2";

const AdminSelectionForm = ({ selectedProject, data, categories }) => {
  const [showAddDataModal, setShowAddDataModal] = useState(false);

  const renderAddDataButton = () => (
    [
      "Residential Training Project for EMRS Teachers",
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
    )
  );

  const renderForms = () => {
    if (selectedProject?.name === "Residential Training Project for EMRS Teachers") {
      return (
        <TrainingForm
          isOpen={showAddDataModal}
          onClose={() => setShowAddDataModal(false)}
        />
      );
    }

    if (selectedProject?.name === "Digital Device Procurement") {
      return (
        <DeviceForm
          isOpen={showAddDataModal}
          categories={categories}
          data={data}
          onClose={() => setShowAddDataModal(false)}
        />
      );
    }

    if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
      return (
        <SanitaryPadForm
          isOpen={showAddDataModal}
          onClose={() => setShowAddDataModal(false)}
        />
      );
    }

    return null;
  };

  return (
    <>
    <div >
      {renderAddDataButton()}
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
