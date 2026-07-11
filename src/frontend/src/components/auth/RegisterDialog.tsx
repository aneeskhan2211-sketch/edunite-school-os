import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegister } from "@/hooks/useAuth";
import { DEMO_USERS, ROLE_LABELS } from "@/store/roleStore";
import type { Role } from "@/types";
import { useState } from "react";

const ROLES = Object.keys(ROLE_LABELS) as Role[];

/**
 * Shown once after sign-in when the principal has no account yet. Binds the
 * authenticated Internet Identity to a role + the seeded user it represents
 * (self-claim). The first person to register becomes the owner.
 */
export function RegisterDialog() {
  const [role, setRole] = useState<Role>("teacher");
  const register = useRegister();

  const onConfirm = () => {
    const user = DEMO_USERS[role];
    const userId = BigInt(String(user.id).replace(/[^0-9]/g, "") || "0");
    register.mutate({
      role,
      userId,
      displayName: `${user.firstName} ${user.lastName}`,
    });
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Finish setting up your account</DialogTitle>
          <DialogDescription>
            You're signed in with Internet Identity. Choose the role you'll use
            — this binds your identity to it on the server.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="reg-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {register.isError ? (
            <p className="text-sm text-destructive">
              {(register.error as Error).message}
            </p>
          ) : null}
          <Button
            type="button"
            onClick={onConfirm}
            disabled={register.isPending}
            className="w-full"
          >
            {register.isPending ? "Registering…" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
