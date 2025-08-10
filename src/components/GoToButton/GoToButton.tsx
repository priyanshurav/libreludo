import { type ReactNode } from 'react';
import './GoToButton.css';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
  to: string;
};

export default function GoToButton({ children, to }: Props) {
  return (
    <Link className="go-to-btn" to={to}>
      {children}
    </Link>
  );
}
