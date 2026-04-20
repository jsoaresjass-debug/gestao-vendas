import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-[0.9rem] border border-white/30 bg-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/25"
      >
        Sair
      </button>
    </form>
  );
}
