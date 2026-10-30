import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  displayName?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
}

const getInitials = (name: string | null | undefined): string => {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
};

const UserAvatar = ({ displayName, avatarUrl, size = "sm", className }: UserAvatarProps) => {
  const sizeClass = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  return (
    <Avatar className={cn(sizeClass, className)} title={displayName ?? undefined}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? "User"} />}
      <AvatarFallback className="bg-primary/15 text-primary font-semibold">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
