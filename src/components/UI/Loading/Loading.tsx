export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`spinner spinner-${size}`} role="status" aria-label="Loading" />;
}

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Spinner size="lg" />
    </div>
  );
}
