import type React from 'react';
import styles from './Note.module.css';

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
    <div className={styles.note} role="note" aria-label={type}>
      <strong className={styles.noteLabel}>{getLabel(type)}</strong>
      <span className={styles.noteContent}>{children}</span>
    </div>
  );
}

export default Note;
