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
        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
      />
      <button
        type="submit"
        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
      >
        Buscar
      </button>
    </form>
  );
}
