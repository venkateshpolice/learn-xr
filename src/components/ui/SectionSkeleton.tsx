type SectionSkeletonProps = {
  className?: string;
};

/** Lightweight placeholder while below-the-fold home sections load. */
export default function SectionSkeleton({
  className = "min-h-[320px] sm:min-h-[400px]",
}: SectionSkeletonProps) {
  return (
    <div
      className={`flex items-center justify-center py-16 sm:py-20 ${className}`}
      aria-hidden
    >
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/25 border-t-indigo-400 animate-spin" />
    </div>
  );
}
