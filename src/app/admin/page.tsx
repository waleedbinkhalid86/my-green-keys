"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Leaf,
  LogOut,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AdminSection = "overview" | "users" | "subscriptions" | "content" | "settings";

const compactSurfaceClass = "rounded-md bg-white shadow-sm ring-1 ring-black/5";
const compactStatCardClass = cn(compactSurfaceClass, "p-4 h-32 border border-gray-100");

const ADMIN_LINKS: Array<{ id: AdminSection; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
  { id: "overview", label: "Overview", Icon: Home },
  { id: "users", label: "Users", Icon: Users },
  { id: "subscriptions", label: "Subscriptions", Icon: CreditCard },
  { id: "content", label: "Content", Icon: BookOpen },
  { id: "settings", label: "Settings", Icon: Settings },
];

const growthData = [
  { day: "Mon", users: 120 },
  { day: "Tue", users: 140 },
  { day: "Wed", users: 165 },
  { day: "Thu", users: 210 },
  { day: "Fri", users: 240 },
  { day: "Sat", users: 260 },
  { day: "Sun", users: 310 },
];

const recentSignups = [
  { name: "Ahmed Hassan", type: "Student", joined: "Today" },
  { name: "Fatima Ahmed", type: "Parent", joined: "Yesterday" },
  { name: "Omar Khan", type: "Teacher", joined: "2 days ago" },
  { name: "Zahra Ali", type: "Student", joined: "3 days ago" },
  { name: "Amir Ibrahim", type: "Student", joined: "4 days ago" },
];

export default function AdminPanel() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [mounted, setMounted] = useState(false);
  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const churnRate = 1.8;
  const churnWarning = churnRate >= 4;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-gray-200 bg-white py-8 pl-5 pr-3 lg:flex">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-md bg-gray-900 text-white">
              <Leaf className="h-6 w-6" strokeWidth={2.25} aria-hidden />
            </div>
            <div>
              <p className="font-heading text-sm font-extrabold text-gray-900">My Green Keys</p>
              <p className="text-xs font-semibold text-gray-500">Admin</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {ADMIN_LINKS.map((l) => {
              const active = section === l.id;
              const Icon = l.Icon;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSection(l.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold transition-colors",
                    active ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("size-5 shrink-0", active ? "text-green-600" : "text-gray-400")} strokeWidth={2.25} />
                  {l.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              <LogOut className="size-5" strokeWidth={2.25} aria-hidden />
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:18px_18px]">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-heading text-lg font-extrabold text-gray-900 sm:text-xl">System overview</p>
                <p className="text-sm font-semibold text-gray-500">{today}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                  Export report
                </Button>
              </div>
            </div>
          </header>

          <div className="mgk-container space-y-10 py-8 sm:py-10">
            {section === "overview" ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { Icon: Users, label: "Total Users", value: "—", sub: "All time", iconClass: "bg-sky-50 text-sky-700" },
                    { Icon: CreditCard, label: "Active Subscriptions", value: "—", sub: "Currently active", iconClass: "bg-green-50 text-green-700" },
                    { Icon: DollarSign, label: "MRR", value: "—", sub: "Monthly recurring", iconClass: "bg-emerald-50 text-emerald-700" },
                    {
                      Icon: TrendingDown,
                      label: "Churn Rate",
                      value: `${churnRate.toFixed(1)}%`,
                      sub: churnWarning ? "Needs attention" : "Healthy",
                      iconClass: churnWarning ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-700",
                    },
                  ].map(({ Icon, label, value, sub, iconClass }) => (
                    <div key={label} className={compactStatCardClass}>
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconClass)}>
                        <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                      </div>
                      <p className="mt-3 text-xs text-gray-500">{label}</p>
                      <p className="mt-1 text-2xl font-bold leading-none text-gray-900">{value}</p>
                      <p className="mt-2 text-xs text-gray-400">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border border-gray-100">
                    <CardHeader>
                      <CardTitle className="font-heading text-base">User growth</CardTitle>
                      <CardDescription>Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      {mounted ? (
                        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                          <LineChart data={growthData}>
                            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="#16a34a" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full rounded-md border border-gray-100 bg-white" />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100">
                    <CardHeader>
                      <CardTitle className="font-heading text-base">Subscription health</CardTitle>
                      <CardDescription>Quick signals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { Icon: TrendingUp, label: "Renewals", value: "—" },
                          { Icon: TrendingDown, label: "Failed payments", value: "—" },
                          { Icon: CreditCard, label: "Trials", value: "—" },
                          { Icon: DollarSign, label: "ARPU", value: "—" },
                        ].map(({ Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-2 rounded-md border border-gray-100 bg-white px-4 py-2">
                            <Icon className="h-4 w-4 text-gray-500" strokeWidth={2.25} aria-hidden />
                            <span className="text-sm text-gray-600">{label}:</span>
                            <span className="text-sm font-semibold text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                          Manage plans
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                          View invoices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border border-gray-100">
                    <CardHeader>
                      <CardTitle className="font-heading text-base">Recent signups</CardTitle>
                      <CardDescription>Latest 5</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                            <tr>
                              <th className="px-4 py-3 text-left">Name</th>
                              <th className="px-4 py-3 text-left">Type</th>
                              <th className="px-4 py-3 text-left">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentSignups.map((u) => (
                              <tr key={u.name} className="border-t border-gray-100">
                                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                <td className="px-4 py-3 text-gray-600">{u.type}</td>
                                <td className="px-4 py-3 text-gray-600">{u.joined}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100">
                    <CardHeader>
                      <CardTitle className="font-heading text-base">Content management</CardTitle>
                      <CardDescription>Quick actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                          Add lesson
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                          Edit modules
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                          Review eco actions
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-900 hover:bg-gray-50">
                          Update copy
                        </Button>
                      </div>
                      <div className="mt-6 rounded-md border border-gray-100 bg-white p-6 text-center">
                        <BarChart3 className="mx-auto h-6 w-6 text-gray-400" strokeWidth={2.25} aria-hidden />
                        <p className="mt-2 text-sm font-semibold text-gray-900">More tools coming soon</p>
                        <p className="mt-1 text-sm text-gray-600">Keep it simple and ship iteratively.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="border border-gray-100">
                <CardContent className="py-10 text-center">
                  <FileText className="mx-auto h-6 w-6 text-gray-400" strokeWidth={2.25} aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-gray-900">Section coming soon</p>
                  <p className="mt-1 text-sm text-gray-600">We’ll bring this into the new admin shell next.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
