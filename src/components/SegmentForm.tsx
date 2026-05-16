import { useState } from "react";
import { ProgramSegment } from "../types";
import { Plus } from "lucide-react";

interface SegmentFormProps {
  onAdd: (segment: Omit<ProgramSegment, "id">) => void;
}

const SegmentForm: React.FC<SegmentFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    duration: "",
    personAssigned: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startTime || !formData.duration) {
      alert("Please fill in all required fields");
      return;
    }

    onAdd({
      title: formData.title,
      startTime: formData.startTime,
      duration: parseInt(formData.duration),
      personAssigned: formData.personAssigned || undefined,
    });

    setFormData({
      title: "",
      startTime: "",
      duration: "",
      personAssigned: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-sm border border-purple-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Add Program Segment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Segment Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="e.g., Call to Worship"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Duration (mins) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="5"
              min="1"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="personAssigned"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Person Assigned (Optional)
          </label>
          <input
            type="text"
            id="personAssigned"
            value={formData.personAssigned}
            onChange={(e) => handleChange("personAssigned", e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="e.g., Min Dele"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Add Segment
        </button>
      </form>
    </div>
  );
};

export default SegmentForm;
