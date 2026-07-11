import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { useMyAccount } from "@/hooks/useAuth";
import { variantKey } from "@/lib/candid";
import { router } from "@/router";
import { useRoleStore } from "@/store/roleStore";
import type { Role } from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { createActor } from "./backend";

/**
 * Bridges the platform's authenticated/anonymous backend actor (from the
 * InternetIdentityProvider via useActor) onto window.__ACTOR__, which every
 * data hook in this app reads. Without this, no hook ever has an actor and
 * they all fall back to hard-coded demo data. Once the actor is available we
 * also invalidate all queries so they refetch against the real canister.
 */
function ActorBridge() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const done = useRef(false);
  useEffect(() => {
    if (actor && !done.current) {
      done.current = true;
      (window as { __ACTOR__?: unknown }).__ACTOR__ =
        (actor as unknown as { actor?: unknown }).actor ?? actor;
      queryClient.invalidateQueries();
    }
  }, [actor, queryClient]);
  return null;
}

/**
 * Bridges the authenticated account (principal -> role, server-side) onto the
 * app's role store: a signed-in registered user is pinned to their real role.
 * If they're signed in but not registered yet, prompt them to claim a role.
 * Signed-out users stay in demo / "View as" mode.
 */
function AccountBridge() {
  const { isAuthenticated } = useInternetIdentity();
  const { data: account, isLoading } = useMyAccount();
  const setAuthenticatedRole = useRoleStore((s) => s.setAuthenticatedRole);

  useEffect(() => {
    if (isAuthenticated && account) {
      setAuthenticatedRole(variantKey(account.role) as Role, account.isOwner);
    }
  }, [isAuthenticated, account, setAuthenticatedRole]);

  if (isAuthenticated && !isLoading && account === null) {
    return <RegisterDialog />;
  }
  return null;
}

export default function App() {
  return (
    <>
      <ActorBridge />
      <AccountBridge />
      <RouterProvider router={router} />
    </>
  );
}
