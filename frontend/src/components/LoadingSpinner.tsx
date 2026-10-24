export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="loader-brutal" />
      <p className="font-semibold text-sm text-gray-500">{text}</p>
    </div>
  );
}
