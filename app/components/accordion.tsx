import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import ChevronIcon from "./chevron-icon";


interface AccordionHeaderProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  icon: any;
  colorClass: string;
}

const AccordionHeader = memo(
  ({
    title,
    isOpen,
    onClick,
    icon,
    colorClass,
  }: AccordionHeaderProps) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 transition-all duration-200 ${colorClass}`}
    >
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
        <span className="font-poppins font-semibold text-gray-900">
          {title}
        </span>
      </div>
      <ChevronIcon isOpen={isOpen} />
    </button>
  )
);

AccordionHeader.displayName = 'AccordionHeader';

// ============ Accordion Section Component ============
interface AccordionSectionProps {
  title: string;
  icon: any;
  colorClass: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection = memo(
  ({
    title,
    icon,
    colorClass,
    isOpen,
    onToggle,
    children,
  }: AccordionSectionProps) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <AccordionHeader
        title={title}
        isOpen={isOpen}
        onClick={onToggle}
        icon={icon}
        colorClass={colorClass}
      />
      {isOpen && (
        <div className="border-t border-gray-200">{children}</div>
      )}
    </div>
  )
);

AccordionSection.displayName = 'AccordionSection';


export default AccordionSection;