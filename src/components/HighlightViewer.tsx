'use client'

import React from 'react'

interface HighlightViewerProps {
  highlightId: string
  highlights: any[]
  onClose: () => void
}

export const HighlightViewer: React.FC<HighlightViewerProps> = ({
  highlightId,
  highlights,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-white text-center">
        <h2>Highlight Viewer</h2>
        <p>Coming soon...</p>
        <button 
          onClick={onClose}
          className="bg-white text-black px-4 py-2 rounded mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}
