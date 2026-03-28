import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface MaterialSymbolProps extends Omit<ComponentPropsWithoutRef<"span">, "children" | "className"> {
  name: string;
  filled?: boolean;
  className?: string;
  title?: string;
}

export function MaterialSymbol({
  name,
  filled = false,
  className,
  title,
  ...props
}: MaterialSymbolProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      className={cn("material-symbols-outlined notranslate", filled && "material-symbols-filled", className)}
      title={title}
      {...props}
    >
      {name}
    </span>
  );
}
