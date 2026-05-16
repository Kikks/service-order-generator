import { ProgramSegment } from "../types";
import { Trash2, Clock } from "lucide-react";
import { calculateEndTime, formatTimeRange } from "../utils/timeUtils";

interface SegmentsListProps {
  segments: ProgramSegment[];
  onDelete: (id: string) => void;
}

const SegmentsList: React.FC<SegmentsListProps> = ({ segments, onDelete }) => {
  if (segments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Program Segments
        </h3>
        <p className="text-gray-500 text-center py-8">
          No segments added yet. Add your first segment above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Program Segments ({segments.length})
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {segments.map((segment, index) => {
          const endTime = calculateEndTime(segment.startTime, segment.duration);

          return (
            <div
              key={segment.id}
              className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-gray-800">{segment.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock size={14} />
                    <span>{formatTimeRange(segment.startTime, endTime)}</span>
                    <span className="text-purple-600 font-semibold">
                      ({segment.duration} mins)
                    </span>
                  </div>

                  {segment.personAssigned && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Assigned to:</span>{" "}
                      {segment.personAssigned}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onDelete(segment.id)}
                  className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                  title="Delete segment"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SegmentsList;
