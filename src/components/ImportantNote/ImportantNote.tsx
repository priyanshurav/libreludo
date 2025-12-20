import type React from 'react';
import './ImportantNote.css';

export function ImportantNote(props: React.PropsWithChildren<{ label: string }>) {
  return (
    <span className="important-note">
      <strong className="important-note-label">{props.label}</strong>
      <span className="important-note-content">{props.children}</span>
    </span>
  );
}
