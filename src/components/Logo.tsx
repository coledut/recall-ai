export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`${sizeMap[size]} font-bold tracking-tight`}>
      <span className="text-gray-900">Recall</span>
      <span className="text-green-600">.</span>
    </div>
  );
}
