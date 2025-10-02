import React from "react";
import { AlertCircle } from "lucide-react";
import "./DailyLimitModal.scss";

const DailyLimitModal = ({ onClose }) => {
  return (
    <div className="daily-limit-modal">
      <div className="daily-limit-modal__container">
        {/* Alert Icon */}
        <div className="daily-limit-modal__icon">
          <AlertCircle className="w-16 h-16 text-orange-500" />
        </div>

        {/* Title */}
        <h1 className="daily-limit-modal__title">
          Daglimiet Bereikt
        </h1>

        {/* Message */}
        <div className="daily-limit-modal__message">
          <p className="daily-limit-modal__message-text">
            Vanwege de hoge vraag en om deze app gratis te houden, is de limiet voor vandaag bereikt. Ik werk hard aan een oplossing om het weer beschikbaar te maken en gratis te houden.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="daily-limit-modal__close-button"
        >
          Sluiten
        </button>

        {/* Additional Info */}
        <p className="daily-limit-modal__footer-text">
          Gemaakt door <a href="https://boon-digital.nl" target="_blank" rel="noopener noreferrer" className="daily-limit-modal__footer-link">boon-digital</a>
        </p>
      </div>
    </div>
  );
};

export default DailyLimitModal;
