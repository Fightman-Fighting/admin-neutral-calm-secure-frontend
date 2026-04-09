/** Shared Tailwind class strings for admin shell pages (Prompt admin, Audiences, Countries). */

export const adminPanelClass =
  "rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-lg shadow-brand-navy/5 dark:border-border/60 dark:bg-card sm:p-8";

export const adminHeroPanelClass = `${adminPanelClass} overflow-hidden`;

export const adminLabelClass =
  "text-xs font-semibold uppercase tracking-wide text-brand-slate dark:text-muted-foreground";

export const adminInputClass =
  "mt-1 w-full rounded-lg border border-brand-warm-gray/40 bg-brand-cream/50 px-3 py-2 text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground";

/** Same as adminInputClass without top margin (e.g. select inside a horizontal flex row). */
export const adminInputFlatClass =
  "w-full min-w-0 flex-1 rounded-lg border border-brand-warm-gray/40 bg-brand-cream/50 px-3 py-2 text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground";

export const adminTextareaClass =
  "mt-1 w-full rounded-lg border border-brand-warm-gray/40 bg-brand-cream/50 p-3 font-mono text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground";

export const adminMutedTextClass = "text-sm text-brand-slate dark:text-muted-foreground";

export const adminTitleH1Class =
  "font-serif text-xl font-bold text-brand-navy-dark dark:text-foreground sm:text-2xl";

export const adminTitleH2Class =
  "font-serif text-lg font-bold text-brand-navy-dark dark:text-foreground";

export const adminTitleH3Class =
  "font-serif text-lg font-bold text-brand-navy-dark dark:text-foreground";

/** Hero row primary action (+ ADD NEW PROMPT, Add audience, …) */
export const adminPrimaryCtaClass =
  "ml-auto shrink-0 rounded-full bg-brand-navy-dark px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md transition-all hover:bg-brand-navy hover:shadow-lg hover:shadow-brand-navy/20 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90";

/** Modal / form footer Save, Confirm Yes */
export const adminPrimarySubmitClass =
  "rounded-full bg-brand-navy-dark px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-primary dark:text-primary-foreground";

export const adminOutlineButtonClass =
  "rounded-lg border border-brand-warm-gray/40 px-3 py-2 text-sm transition-colors hover:bg-brand-cream/80 dark:border-border dark:hover:bg-muted/50";

export const adminCancelButtonClass =
  "rounded-lg border border-brand-warm-gray/40 px-3 py-2 text-sm dark:border-border";

export const adminCancelButtonDisabledClass =
  "rounded-lg border border-brand-warm-gray/40 px-3 py-2 text-sm disabled:opacity-60 dark:border-border";

export const adminTableEditButtonClass =
  "rounded-lg border border-brand-warm-gray/40 px-3 py-1.5 text-xs transition-colors hover:bg-brand-cream/80 disabled:opacity-60 dark:border-border dark:hover:bg-muted/50";

export const adminTableDeleteButtonClass =
  "rounded-lg border border-rose-300 px-3 py-1.5 text-xs text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40";

export const adminPaginationButtonClass =
  "rounded-lg border border-brand-warm-gray/40 px-3 py-1.5 disabled:opacity-60 dark:border-border";

export const adminModalWidePanelClass =
  "w-full max-w-3xl rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-2xl dark:border-border dark:bg-card sm:p-8";

export const adminModalNarrowPanelClass =
  "w-full max-w-md rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-2xl dark:border-border dark:bg-card";

/** Inline create/edit block (same chrome as modal body, full width) */
export const adminFormEmbedPanelClass =
  "w-full rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-2xl dark:border-border dark:bg-card sm:p-8";

export const adminTableClass =
  "min-w-full divide-y divide-brand-warm-gray/30 text-sm dark:divide-border";

export const adminTableHeadRowClass =
  "text-left text-xs uppercase tracking-wide text-brand-slate dark:text-muted-foreground";

export const adminTableBodyClass =
  "divide-y divide-brand-warm-gray/20 dark:divide-border";

export const adminErrorTextClass = "text-sm text-rose-700 dark:text-rose-400";

export const adminSuccessTextClass = "text-sm text-brand-teal-dark dark:text-brand-teal-light";

export const adminTableSortButtonClass =
  "inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center p-0 text-brand-slate hover:text-brand-navy-dark dark:text-muted-foreground dark:hover:text-foreground";
