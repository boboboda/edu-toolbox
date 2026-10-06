type IconProps = {
  d: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function Icon({
  d,
  size = 38,
  color = "#14213d",
  strokeWidth = 2,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}