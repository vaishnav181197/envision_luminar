import { CheckCircle2, Clock, Mail, Trophy, Vote } from "lucide-react";

const RULES = [
  {
    icon: Mail,
    title: "Registered emails only",
    description:
      "Admins publish every competing UI and register the student emails that may vote.",
  },
  {
    icon: Vote,
    title: "Listed email opens voting",
    description:
      "Enter the email on the voter list to open the gallery. Unlisted emails cannot vote.",
  },
  {
    icon: Trophy,
    title: "One vote per student",
    description:
      "Cast exactly one vote for your favorite design. You may change your vote before the deadline.",
  },
  {
    icon: Clock,
    title: "Deadline enforced",
    description:
      "Voting and student entry close at the competition deadline. No new votes are accepted after that time.",
  },
  {
    icon: CheckCircle2,
    title: "Winner by community vote",
    description:
      "The project with the highest vote count when voting closes is declared the winner.",
  },
];

export function ContestRulesSection() {
  return (
    <section id="rules" className="relative z-10 bg-[#121212] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400/80">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contest Rules
          </h2>
          <p className="mt-4 text-base text-white/60">
            Fair, simple, and designed to celebrate the best student UI work.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((rule) => (
            <article
              key={rule.title}
              className="group rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition-colors group-hover:bg-cyan-400/20">
                <rule.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{rule.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {rule.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
