import React from 'react';
import { List, CheckSquare, Square } from 'lucide-react';

interface FormattedDescriptionProps {
  text: string;
  className?: string;
}

export const FormattedDescription: React.FC<FormattedDescriptionProps> = ({ text, className = '' }) => {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 text-slate-700 dark:text-slate-200 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Checklist items
        if (trimmed.startsWith('[ ]') || trimmed.startsWith('[x]') || trimmed.startsWith('[X]')) {
          const isChecked = trimmed.startsWith('[x]') || trimmed.startsWith('[X]');
          const content = trimmed.slice(3).trim();
          return (
            <div key={idx} className="flex items-start space-x-2 my-0.5 font-normal">
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
              )}
              <span className={isChecked ? 'line-through opacity-60' : 'font-normal text-inherit'}>
                {content}
              </span>
            </div>
          );
        }

        // Bullet items (•, -, *)
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start space-x-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 flex-shrink-0 mt-2 shadow-2xs" />
              <span className="font-normal text-inherit">{content}</span>
            </div>
          );
        }

        // Numbered list items (1., 2., 3., etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
        if (numMatch) {
          const [, num, content] = numMatch;
          return (
            <div key={idx} className="flex items-start space-x-2 my-0.5">
              <span className="inline-flex items-center justify-center min-w-[18px] h-4 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 rounded-md flex-shrink-0 mt-0.5 border border-sky-200/60 dark:border-sky-800">
                {num}
              </span>
              <span className="font-normal text-inherit">{content}</span>
            </div>
          );
        }

        // Regular line
        return (
          <p key={idx} className="font-normal text-inherit">
            {line}
          </p>
        );
      })}
    </div>
  );
};
