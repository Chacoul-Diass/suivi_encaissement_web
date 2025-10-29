import { IconLockOpen } from "@tabler/icons-react";

interface IconProps {
  className?: string;
  size?: number;
  stroke?: number;
}

const Icon = ({ className, size = 24, stroke = 2 }: IconProps) => {
  return (
    <IconLockOpen
      size={size}
      stroke={stroke}
      className={className}
    />
  );
};

export default Icon;
