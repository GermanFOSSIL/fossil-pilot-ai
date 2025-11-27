import { supabase } from "@/integrations/supabase/client";

export interface SystemKpis {
  totalItrA: number;
  completedItrA: number;
  percentItrACompleted: number;
  totalItrB: number;
  completedItrB: number;
  percentItrBCompleted: number;
  punchOpenByCategory: { A: number; B: number; C: number };
  punchClosed: number;
  preservationOverdueCount: number;
  preservationUpcomingCount: number;
  hasCriticalPunch: boolean;
  hasIncompletedItrB: boolean;
}

export interface SubsystemKpis {
  totalItrA: number;
  completedItrA: number;
  percentItrACompleted: number;
  totalItrB: number;
  completedItrB: number;
  percentItrBCompleted: number;
  punchOpen: number;
  punchClosed: number;
  preservationOverdueCount: number;
}

export async function getSystemKpis(systemId: string): Promise<SystemKpis> {
  // Get all subsystems for this system
  const { data: subsystems } = await supabase
    .from("subsystems")
    .select("id")
    .eq("system_id", systemId);

  const subsystemIds = subsystems?.map((s) => s.id) || [];

  // Get ITRs
  const { data: itrs } = await supabase
    .from("itrs")
    .select("itr_type, status")
    .in("subsystem_id", subsystemIds);

  const itrA = itrs?.filter((i) => i.itr_type === "A") || [];
  const itrB = itrs?.filter((i) => i.itr_type === "B") || [];

  const completedItrA = itrA.filter((i) => i.status === "COMPLETED").length;
  const completedItrB = itrB.filter((i) => i.status === "COMPLETED").length;

  // Get Punch items
  const { data: punchItems } = await supabase
    .from("punch_items")
    .select("category, status")
    .in("subsystem_id", subsystemIds);

  const punchOpen = punchItems?.filter((p) => p.status === "OPEN" || p.status === "IN_PROGRESS") || [];
  const punchClosed = punchItems?.filter((p) => p.status === "CLOSED").length || 0;

  const punchOpenByCategory = {
    A: punchOpen.filter((p) => p.category === "A").length,
    B: punchOpen.filter((p) => p.category === "B").length,
    C: punchOpen.filter((p) => p.category === "C").length,
  };

  // Get tags for preservation
  const { data: tags } = await supabase
    .from("tags")
    .select("id")
    .in("subsystem_id", subsystemIds);

  const tagIds = tags?.map((t) => t.id) || [];

  // Get preservation tasks
  const { data: preservationTasks } = await supabase
    .from("preservation_tasks")
    .select("status, next_due_date")
    .in("tag_id", tagIds);

  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const preservationOverdueCount = preservationTasks?.filter((p) => p.status === "OVERDUE").length || 0;
  const preservationUpcomingCount =
    preservationTasks?.filter((p) => {
      const dueDate = new Date(p.next_due_date);
      return dueDate > today && dueDate <= weekFromNow && p.status === "OK";
    }).length || 0;

  return {
    totalItrA: itrA.length,
    completedItrA,
    percentItrACompleted: itrA.length > 0 ? Math.round((completedItrA / itrA.length) * 100) : 0,
    totalItrB: itrB.length,
    completedItrB,
    percentItrBCompleted: itrB.length > 0 ? Math.round((completedItrB / itrB.length) * 100) : 0,
    punchOpenByCategory,
    punchClosed,
    preservationOverdueCount,
    preservationUpcomingCount,
    hasCriticalPunch: punchOpenByCategory.A > 0,
    hasIncompletedItrB: completedItrB < itrB.length,
  };
}

export async function getSubsystemKpis(subsystemId: string): Promise<SubsystemKpis> {
  // Get ITRs
  const { data: itrs } = await supabase
    .from("itrs")
    .select("itr_type, status")
    .eq("subsystem_id", subsystemId);

  const itrA = itrs?.filter((i) => i.itr_type === "A") || [];
  const itrB = itrs?.filter((i) => i.itr_type === "B") || [];

  const completedItrA = itrA.filter((i) => i.status === "COMPLETED").length;
  const completedItrB = itrB.filter((i) => i.status === "COMPLETED").length;

  // Get Punch items
  const { data: punchItems } = await supabase
    .from("punch_items")
    .select("status")
    .eq("subsystem_id", subsystemId);

  const punchOpen = punchItems?.filter((p) => p.status === "OPEN" || p.status === "IN_PROGRESS").length || 0;
  const punchClosed = punchItems?.filter((p) => p.status === "CLOSED").length || 0;

  // Get tags
  const { data: tags } = await supabase
    .from("tags")
    .select("id")
    .eq("subsystem_id", subsystemId);

  const tagIds = tags?.map((t) => t.id) || [];

  // Get preservation tasks
  const { data: preservationTasks } = await supabase
    .from("preservation_tasks")
    .select("status")
    .in("tag_id", tagIds);

  const preservationOverdueCount = preservationTasks?.filter((p) => p.status === "OVERDUE").length || 0;

  return {
    totalItrA: itrA.length,
    completedItrA,
    percentItrACompleted: itrA.length > 0 ? Math.round((completedItrA / itrA.length) * 100) : 0,
    totalItrB: itrB.length,
    completedItrB,
    percentItrBCompleted: itrB.length > 0 ? Math.round((completedItrB / itrB.length) * 100) : 0,
    punchOpen,
    punchClosed,
    preservationOverdueCount,
  };
}
