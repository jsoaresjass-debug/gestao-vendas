type SearchFormProps = {
  defaultValue?: string;
};

export function SearchForm({ defaultValue }: SearchFormProps) {
  return (
    <form className="flex flex-col gap-3 md:flex-row">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar por nome, telefone ou e-mail"
        className="min-w-0 flex-1 rounded-[1.25rem] border border-[var(--border)] px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#a28e81] focus:border-[#b68f79] focus:bg-white"
      />
      <button
        type="submit"
        className="rounded-[1.25rem] border border-[var(--border)] bg-white/70 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)] transition hover:border-[#c6a795] hover:bg-white"
      >
        Buscar
      </button>
    </form>
  );
}
