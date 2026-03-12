export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-6 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-zinc-500 sm:flex-row dark:text-zinc-400">
          <p>
            Pollen data from Google Pollen API and Ambee. Thresholds based on
            NAB (National Allergy Bureau) standards.
          </p>
          <p>
            Not medical advice. Consult your allergist for personalised
            guidance.
          </p>
        </div>
      </div>
    </footer>
  );
}
