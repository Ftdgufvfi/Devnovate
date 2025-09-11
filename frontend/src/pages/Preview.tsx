import React from 'react';

const Preview: React.FC = () => {
  return (
    <div className="h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg h-full">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Preview Mode
            </h1>
            <p className="text-gray-600">
              Your application preview will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
