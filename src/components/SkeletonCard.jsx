import "./SkeletonCard.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton circle" />
        <div className="skeleton-lines">
          <div className="skeleton line short" />
          <div className="skeleton line xshort" />
        </div>
      </div>
      <div className="skeleton line medium" />
      <div className="skeleton line xshort" />
    </div>
  );
}
