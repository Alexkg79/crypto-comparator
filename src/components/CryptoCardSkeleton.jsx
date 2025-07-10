export default function CryptoCardSkeleton() {
  return (
    <div className="crypto-card-skeleton">
      <div className="crypto-card-skeleton__header">
        <div className="skeleton crypto-card-skeleton__image"></div>
        <div className="crypto-card-skeleton__info">
          <div className="skeleton crypto-card-skeleton__line crypto-card-skeleton__line--lg"></div>
          <div className="skeleton crypto-card-skeleton__line crypto-card-skeleton__line--sm"></div>
        </div>
      </div>
      <div className="crypto-card-skeleton__details">
        <div className="skeleton crypto-card-skeleton__line"></div>
        <div className="skeleton crypto-card-skeleton__line"></div>
        <div className="skeleton crypto-card-skeleton__line"></div>
      </div>
    </div>
  );
}