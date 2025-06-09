import {  Save, X, InfoIcon, SquarePen } from "lucide-react";

const TableActions = ({
  row,
  editingRow,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  setTimelineModal,
  setImageModal,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Edit/Save Actions */}
      {editingRow === row.id ? (
        <>
          <button
            onClick={() => handleEditSave(row)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Save changes"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleEditCancel}
            className="p-1 text-red-600 hover:text-red-800"
            title="Cancel edit"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <button
          onClick={() => handleEditStart(row)}
          className="p-1 text-blue-600 hover:text-blue-800"
          title="Edit status"
        >
          <SquarePen size={16} />
        </button>
      )}

      {/* Timeline Button */}
      <button
        onClick={() => setTimelineModal({ isOpen: true, row })}
        className="p-1 text-purple-600 hover:text-purple-800"
        title="View timeline"
      >
        <InfoIcon size={16} />
      </button>
    </div>
  );
};

export default TableActions;
