type SearchFormProps = {
  defaultValue?: string;
  placeholder?: string;
};

export function SearchForm({
  defaultValue,
  placeholder = "Buscar por nome, telefone ou e-mail",
}: SearchFormProps) {
  return (
    <form className="flex flex-col gap-3 md:flex-row">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3] focus:bg-white"
      />
      <button
        type="submit"
        className="rounded-[1.25rem] border border-[var(--border)] bg-[#f4f9ff] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)] transition hover:border-[#bfd8f6] hover:bg-white"
      >
        Buscar
      </button>
    </form>
  );
}
