import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

interface PresentationDetailsProps {
  presentation: {
    title: string;
    authors: { name: string; initials: string }[];
  };
  onScoringClick: () => void;
}

export default function PresentationDetails({
  presentation,
  onScoringClick,
}: PresentationDetailsProps) {
  return (
    <div
      id="title-details"
      className="bg-white rounded-lg shadow-lg p-6 lg:p-8 border border-gray-100 animate-fade-in"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg p-3 shadow-md">
              <FontAwesomeIcon icon={faTrophy} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-poppins text-3xl font-bold text-gray-900">
                {presentation.title}
              </h2>
              <p className="text-gray-600 font-poppins text-sm mt-2">
                Presentation Details & Information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-poppins text-gray-600 leading-relaxed">
              This is detailed information about <strong>{presentation.title}</strong>. You
              can view and manage all relevant details here including evaluation
              criteria, scoring guidelines, and submission requirements.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-poppins text-sm font-semibold text-gray-900 mb-4">
                Researchers / Authors
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {presentation.authors.map((researcher, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                      <span className="text-white font-poppins font-bold text-lg">
                        {researcher.initials}
                      </span>
                    </div>
                    <p className="font-poppins text-xs font-semibold text-gray-900 text-center line-clamp-2">
                      {researcher.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Procedure Button */}
        <div className="w-full lg:w-72">
          <button
            onClick={onScoringClick}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white font-poppins font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FontAwesomeIcon
              icon={faTrophy}
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
            Scoring Procedure
          </button>
          <p className="font-poppins text-xs text-gray-600 text-center mt-4 leading-relaxed">
            Review the scoring criteria and evaluate this presentation
          </p>
        </div>
      </div>
    </div>
  );
}
