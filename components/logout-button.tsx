import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full border border-[var(--border)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1c1512]"
      >
        Sair
      </button>
    </form>
  );
}
