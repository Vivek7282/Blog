export function StatusMessage({
  error,
  success
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className={error ? "banner banner-error" : "banner banner-success"}>
      {error || success}
    </div>
  );
}
