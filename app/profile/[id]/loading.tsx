// app/profile/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading profile data...</div>
    </div>
  );
}
