import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Lightbulb, Wrench } from 'lucide-react';
import { DiagnosisError } from '../services/errorDiagnosis';

interface ErrorDiagnosisHelpProps {
  errors: DiagnosisError[];
  suggestions: string[];
  onFix?: (errorIndex: number) => void;
  onDismiss?: () => void;
}

export const ErrorDiagnosisHelp: React.FC<ErrorDiagnosisHelpProps> = ({
  errors,
  suggestions,
  onFix,
  onDismiss
}) => {
  if (errors.length === 0 && suggestions.length === 0) {
    return null;
  }

  const getErrorIcon = (type: DiagnosisError['type']) => {
    switch (type) {
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'info':
        return <CheckCircle size={20} className="text-blue-500" />;
    }
  };

  const getErrorColor = (type: DiagnosisError['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Lightbulb size={18} className="text-white" />
          </div>
          <h3 className="font-black text-white">Code Diagnosis</h3>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XCircle size={18} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Issues Found ({errors.length})
          </h4>
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${getErrorColor(error.type)}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{getErrorIcon(error.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">
                      {error.message}
                    </p>
                    <p className="text-xs text-slate-300 mb-2">
                      💡 {error.suggestion}
                    </p>
                    {onFix && error.blockIndex !== undefined && (
                      <button
                        onClick={() => onFix(idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        <Wrench size={12} />
                        Auto-Fix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Tips
          </h4>
          <div className="space-y-1.5">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/50"
              >
                <Lightbulb size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-300">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
