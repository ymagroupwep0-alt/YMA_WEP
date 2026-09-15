import Image from 'next/image';

export function CompanyLogo({
  width,
  height,
  className,
  priority = false,
}: {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/company-logo.jpg"
      alt="YMA Automation Engineering"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain ${className ?? ''}`}
    />
  );
}