import React from 'react';

interface PrintContainerProps {
  title: string;
  htmlContent: string;
  updatedAt: number;
}

export const PrintContainer: React.FC<PrintContainerProps> = ({
  title,
  htmlContent,
  updatedAt,
}) => {
  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      id="print-container"
      className="hidden print:block print-area w-full bg-white text-black p-8"
      style={{ display: 'none' }}
    >
      <header className="mb-6 border-b border-black/30 pb-4">
        <h1 className="text-3xl font-bold text-black tracking-tight mb-2">
          {title}
        </h1>
        <div className="text-xs text-neutral-600">
          Última actualización: {formattedDate}
        </div>
      </header>

      <div
        className="tiptap-content prose max-w-none print:text-black leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
