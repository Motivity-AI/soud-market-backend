import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="bg-white rounded-2xl border p-12 text-center">
      <PackageOpen className="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800">{title}</h3>
      {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
    </div>
  );
}
