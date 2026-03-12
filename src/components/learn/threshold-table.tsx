import { NAB_THRESHOLDS } from "@/lib/pollen/thresholds";

export function ThresholdTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="px-4 py-3 text-left font-semibold">Category</th>
            <th className="px-4 py-3 text-center font-semibold">
              <span className="text-green-600 dark:text-green-400">Low</span>
            </th>
            <th className="px-4 py-3 text-center font-semibold">
              <span className="text-amber-600 dark:text-amber-400">Moderate</span>
            </th>
            <th className="px-4 py-3 text-center font-semibold">
              <span className="text-orange-600 dark:text-orange-400">High</span>
            </th>
            <th className="px-4 py-3 text-center font-semibold">
              <span className="text-red-600 dark:text-red-400">Very High</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {(["tree", "grass", "weed"] as const).map((cat) => {
            const t = NAB_THRESHOLDS[cat];
            return (
              <tr
                key={cat}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-medium capitalize">{cat}</td>
                <td className="px-4 py-3 text-center">1-{t.low - 1}</td>
                <td className="px-4 py-3 text-center">
                  {t.low}-{t.moderate - 1}
                </td>
                <td className="px-4 py-3 text-center">
                  {t.moderate}-{t.high - 1}
                </td>
                <td className="px-4 py-3 text-center">{t.high}+</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Values in grains/m³. Based on NAB (National Allergy Bureau) standards from the AAAAI.
      </p>
    </div>
  );
}
