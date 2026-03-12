import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-zinc-200 dark:text-zinc-700">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
