interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}
export default function Button({ children, onClick }: ButtonProps) {
  return (
    <div className="inline-block text-sm cursor-pointer px-3 py-1 rounded-sm bg-green-700 text-white" onClick={onClick}>
      {children}
    </div>
  );
}
