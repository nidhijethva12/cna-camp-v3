import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { ArrowRight, Check } from "@/components/ui/icons";
import { homeStory as s } from "@/content/about";

export function StorySection() {
  return (
    <section className="wrap mt-16 grid items-center gap-12 sm:mt-24 lg:grid-cols-2" aria-labelledby="story-title">
      <div className="reveal relative">
        <div className="group relative aspect-[4/3] overflow-hidden rounded-card">
          <Photo
            img={s.image}
            alt={s.imageAlt}
            sizes="(min-width: 1024px) 590px, 100vw"
            className="transition duration-700 group-hover:scale-[1.04]"
          />
        </div>
        <div className="absolute right-4 -bottom-6 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-light bg-primary text-center text-light shadow-float sm:-right-6 sm:h-36 sm:w-36">
          <span className="display text-[34px] leading-none sm:text-[42px]">{s.badge[0]}</span>
          <span className="mt-1 text-[13px] font-semibold">{s.badge[1]}</span>
        </div>
      </div>

      <div className="reveal">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="story-title" className="h-section mt-3">
          {s.title}
        </h2>
        {s.body.map((p, i) => (
          <p key={i} className={`${i ? "mt-3" : "mt-5"} text-[17px] leading-relaxed text-muted`}>
            {p}
          </p>
        ))}
        <ul className="mt-7 space-y-4 sm:space-y-5">
          {s.points.map(([title, text]) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dark text-[14px] text-secondary">
                <Check />
              </span>
              <div>
                <h3 className="text-[18px] leading-normal">{title}</h3>
                <p className="mt-0.5 text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href={s.link.href} className="btn btn-dark mt-8">
          {s.link.label} <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
