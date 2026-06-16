import { createFileRoute } from "@tanstack/react-router";
import { Activity, Heart, Sparkles, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PageHeader, SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { useSwipeIt } from "@/lib/swipeit-store";

const weekly = [
  { day: "L", value: 22 },
  { day: "M", value: 31 },
  { day: "M", value: 18 },
  { day: "J", value: 46 },
  { day: "V", value: 38 },
  { day: "S", value: 54 },
  { day: "D", value: 42 },
];
const categoriesData = [
  { name: "Musique", value: 34 },
  { name: "Films", value: 24 },
  { name: "Food", value: 18 },
  { name: "Autres", value: 24 },
];
const colors = ["var(--primary)", "var(--chart-2)", "var(--chart-3)", "var(--muted)"];

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "Statistiques — SwipeIt" }] }),
  component: StatsPage,
});

function StatsPage() {
  const { swipes, favorites } = useSwipeIt();
  const metrics = [
    { icon: Zap, value: swipes, label: "Swipes" },
    { icon: Heart, value: favorites.length + 87, label: "Likes" },
    { icon: Activity, value: "38%", label: "Engagement" },
    { icon: Sparkles, value: "7 j", label: "Streak" },
  ];

  return (
    <PaywallGuard>
      <SwipeItShell wide>
        <PageHeader eyebrow="Votre activite" title="Statistiques" />

        <main className="px-5 sm:px-8">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 animate-slide-up">
            {metrics.map(({ icon: Icon, value, label }) => (
              <article key={label} className="glass-subtle rounded-xl p-5 text-center">
                <Icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-4 font-display text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </article>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr] animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Bar chart */}
            <section className="glass-subtle rounded-2xl p-5">
              <h2 className="font-display text-lg font-bold">Rythme de decouverte</h2>
              <p className="text-xs text-muted-foreground">7 derniers jours</p>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Pie chart */}
            <section className="glass-subtle rounded-2xl p-5">
              <h2 className="font-display text-lg font-bold">Vos univers</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoriesData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={4}
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoriesData.map((item, index) => (
                  <span key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[index] }} />
                    {item.name} - {item.value}%
                  </span>
                ))}
              </div>
            </section>
          </div>
        </main>
      </SwipeItShell>
    </PaywallGuard>
  );
}
