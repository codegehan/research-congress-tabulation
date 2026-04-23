import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import ChevronIcon from "./chevron-icon";
import ListItem from "./lists-items";

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    titles: string[];
  };
  isExpanded: boolean;
  selectedTitle: string | null;
  onToggle: () => void;
  onSelectTitle: (title: string) => void;
  colorClass: string;
}

const CategoryItem = memo(
  ({
    category,
    isExpanded,
    selectedTitle,
    onToggle,
    onSelectTitle,
    colorClass,
  }: CategoryItemProps) => (
    <div>
      <button
        onClick={onToggle}
        className={`w-full text-left px-4 py-3 font-poppins text-sm transition-all duration-200 border-l-4 flex items-center gap-3 ${
          isExpanded
            ? `bg-gradient-to-r from-orange-100 to-orange-50 border-orange-500 text-orange-700 font-semibold shadow-sm`
            : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-orange-300'
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4" />
          <span className="truncate">{category.name}</span>
        </div>
        <ChevronIcon isOpen={isExpanded} />
      </button>
      {isExpanded && (
        <div className="bg-gradient-to-b from-gray-50 to-white divide-y border-l-4 border-orange-300">
          {category.titles.map((title, idx) => (
            <ListItem
              key={idx}
              title={title}
              isSelected={selectedTitle === title}
              onClick={() => onSelectTitle(title)}
              indent="px-8"
            />
          ))}
        </div>
      )}
    </div>
  )
);

CategoryItem.displayName = 'CategoryItem';

export default CategoryItem;