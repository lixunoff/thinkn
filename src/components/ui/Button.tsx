interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({ children, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        border: '2px solid white',
        color: 'white',
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: 700,
        padding: '8px 24px',
        borderRadius: '999px',
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
