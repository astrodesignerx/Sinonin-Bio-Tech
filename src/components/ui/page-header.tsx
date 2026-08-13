import Reveal from "@/components/ui/reveal";
import BrandRule from "@/components/ui/brand-rule";

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
        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <BrandRule />
            <h1 className="heading-page mt-6">{title}</h1>
          </div>
          {intro && (
            <p className="leading-relaxed text-ink-muted sm:text-lg lg:col-span-5 lg:col-start-8">
              {intro}
            </p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
