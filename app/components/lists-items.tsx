import { faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";

// ============ List Item Component (DRY) ============
interface ListItemProps {
  title: string;
  contestantNo: string;
  isSelected: boolean;
  isDone?: boolean;
  onClick: () => void;
  indent?: string;
}

const ListItem = memo(
  ({ title, contestantNo, isSelected, isDone, onClick, indent = 'px-4' }: ListItemProps) => (
    <button
      onClick={onClick}
      className={`w-full text-left ${indent} py-3 font-poppins text-sm transition-all duration-200 border-l-4 flex items-center gap-3 ${
        isSelected
          ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-500 text-orange-700 font-semibold shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-orange-300'
      }`}
    >
      <FontAwesomeIcon icon={faTag} className="w-3 h-3 flex-shrink-0" />
      <span className="truncate flex-1">{contestantNo ? `${contestantNo} -` : ''} {title}</span>
      {isDone && (
        <span className="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
          DONE
        </span>
      )}
    </button>
  )
);

ListItem.displayName = 'ListItem';

export default ListItem;