import React, { useState, useEffect } from 'react';
import { TheoryAnalysis } from '../../types';
import { Icon } from '../icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const BrainCircuitIcon = () => <Icon className="h-8 w-8 text-primary"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5V5h0a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 17 5V7a2 2 0 0 1-2 2h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a2 2 0 0 1 2 2v2a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 12 19.5V19h0a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 7 19.5V17a2 2 0 0 1 2-2h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H8a2 2 0 0 1-2-2V5a2.5 2.5 0 0 1 2.5-2.5Z"/></Icon>;

const MOCK_ANALYSIS_1: TheoryAnalysis = {
  keyPoints: [
    "The theory posits a direct link between seismic activity and ancient ley lines.",
    "It suggests an external, intelligent force is activating a subterranean network.",
    "The ultimate goal of this activation remains unknown but is implied to be significant."
  ],
  possibleFallacies: [
    "Correlation vs. Causation: Assuming that because two events occur together (seismic activity and ley line alignment), one must be causing the other.",
    "Argument from Ignorance: The argument relies on the lack of a 'natural' explanation as proof of an artificial one.",
  ],
  counterArguments: [
    "Geological Explanations: Modern seismology provides well-understood models for tectonic plate movement and seismic events that do not require external activation.",
    "Confirmation Bias: Ley lines are often drawn by connecting historical sites, and with enough points, patterns can emerge by chance.",
  ],
  relatedTopics: [
    "Hollow Earth Theory",
    "Geomancy",
    "Project Stargate (CIA psychic research)",
    "Nikola Tesla's Earthquake Machine"
  ]
};

const MOCK_ANALYSIS_2: TheoryAnalysis = {
  keyPoints: [
    "The post alleges that smart devices form a global surveillance network.",
    "It claims the data is used for control, not advertising.",
    "The primary call to action is to 'disconnect' periodically."
  ],
  possibleFallacies: [
    "Slippery Slope: Suggests that data collection for ads will inevitably lead to totalitarian control without sufficient evidence.",
    "Conspiracy Theory: Assumes a secret, coordinated effort by powerful entities without direct proof."
  ],
  counterArguments: [
    "Data for Services: Tech companies argue that data collection is necessary to provide free services and personalized experiences.",
    "Regulation and Privacy Laws: Laws like GDPR exist to give users control over their data and limit how companies can use it.",
    "Lack of Evidence: There is no public, verifiable evidence of a coordinated global surveillance network for 'control' as described."
  ],
  relatedTopics: [
    "PRISM Program (NSA Surveillance)",
    "Social Credit System",
    "Data Privacy",
    "Cambridge Analytica"
  ]
};

const ALL_MOCK_ANALYSES = [MOCK_ANALYSIS_1, MOCK_ANALYSIS_2];

interface TheoryAnalysisModalProps {
  postText: string;
  onClose: () => void;
}

const TheoryAnalysisModal: React.FC<TheoryAnalysisModalProps> = ({ postText, onClose }) => {
  const [analysis, setAnalysis] = useState<TheoryAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- MOCK API CALL ---
    setIsLoading(true);
    const timer = setTimeout(() => {
      const randomAnalysis = ALL_MOCK_ANALYSES[Math.floor(Math.random() * ALL_MOCK_ANALYSES.length)];
      setAnalysis(randomAnalysis);
      setIsLoading(false);
    }, 2000); // Simulate network delay

    return () => clearTimeout(timer);
  }, [postText]);

  const AnalysisSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 border-b border-light-border dark:border-dark-border pb-1">{title}</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <BrainCircuitIcon />
            <h2 className="text-xl font-bold">AI Theory Analysis</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 font-semibold">Analyzing theory with neutral skepticism...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while the AI cross-references data streams.</p>
            </div>
          ) : analysis ? (
            <>
              <AnalysisSection title="Key Points" items={analysis.keyPoints} />
              <AnalysisSection title="Possible Logical Fallacies" items={analysis.possibleFallacies} />
              <AnalysisSection title="Counter-Arguments & Alternative Views" items={analysis.counterArguments} />
              <AnalysisSection title="Connections & Related Topics" items={analysis.relatedTopics} />
            </>
          ) : (
            <p>Could not generate analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoryAnalysisModal;