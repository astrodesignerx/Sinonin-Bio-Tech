import Reveal from "@/components/ui/reveal";

export default function PageHeader({
  title,
  intro,
}: {
  title: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
      <Reveal>
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted sm:text-lg">
            {intro}
          </p>
        )}
      </Reveal>
    </div>
  );
}
