export default function VersionFooter() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  const sha = process.env.NEXT_PUBLIC_GIT_SHA ?? "dev";
  return (
    <div className="text-center text-xs text-gray-400 py-3">
      Toán Vui v{version}
      {sha !== "dev" && <span className="ml-1 opacity-60">· {sha}</span>}
    </div>
  );
}
