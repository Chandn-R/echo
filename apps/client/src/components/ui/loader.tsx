import { Loader2 } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[100px] w-full">
      <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
    </div>
  );
}
