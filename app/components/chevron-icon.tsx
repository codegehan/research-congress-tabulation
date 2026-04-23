import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";

const ChevronIcon = memo(({ isOpen }: { isOpen: boolean }) => (
  <FontAwesomeIcon
    icon={faChevronDown}
    className={`w-4 h-4 transition-transform duration-300 ${
      isOpen ? 'rotate-180' : ''
    }`}
  />
));

ChevronIcon.displayName = 'ChevronIcon';


export default ChevronIcon;