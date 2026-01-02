import type React from 'react';
import './Note.css';

type TLabelType = 'important' | 'bonus';

type Props = {
  type: TLabelType;
};

function getLabel(type: TLabelType): React.ReactElement {
  switch (type) {
    case 'important':
      return (
        <>
          <span aria-hidden="true">⚠️</span>&nbsp;Important:
        </>
      );
    case 'bonus':
      return (
        <>
          <span aria-hidden="true">⭐</span>&nbsp;Bonus:
        </>
      );
  }
}

function Note({ type, children }: React.PropsWithChildren<Props>) {
  return (
    <div className="note" role="note" aria-label={type}>
      <strong className="note-label">{getLabel(type)}</strong>
      <span className="note-content">{children}</span>
    </div>
  );
}

export default Note;
