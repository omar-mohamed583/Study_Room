import { memo, type RefObject } from "react";
import { redirect } from "react-router";
import { ensureSession } from "~/auth/session";
import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import SideRays from "~/components/SideRays";
import AreaChartComp from "~/components/ui/global/AreaChart";
import StatsChart from "~/components/ui/global/StatsChart";
import CreateTaskForm from "~/components/ui/dashboard-page/CreateEventForm";
import TasksBoard from "~/components/ui/dashboard-page/TasksBoard";
import useTheme from "~/context/themeContext";
import type { AreaPoint } from "~/components/utils/dayStats";

const MemSideRays = memo(({ theme }: { theme: "light" | "dark" }) => (
  <SideRays
    rayColor1={theme === "dark" ? "#FFC46B" : "#00bcd4"}
    rayColor2={theme === "dark" ? "#96c8ff" : "#fff"}
    origin="top-right"
    speed={2.9}
    intensity={3}
    spread={2.4}
    density={5}
    followMouse={false}
    blend={0.9}
    sharpness={0.6}
    tilt={-4}
    falloff={1.6}
    glow={1.5}
    saturation={0.6}
    dust={0}
    mouseInfluence={0.5}
    intro
    opacity={1}
  />
));

export default function DashboardPage({
  statsChartData,
  areaChartData,
  searchEvent,
  formValues,
  dueValue,
  errors,
  formError,
  handleDueDateChange,
  mutation,
  onSubmit,
  updateFunc,
  validateField,
}: {
  statsChartData: { title: string; chartData: any }[];
  areaChartData: AreaPoint[];
  searchEvent: RefObject<string | null>;
  formValues: any;
  dueValue: any;
  errors: any;
  formError: any;
  handleDueDateChange: any;
  mutation: any;
  onSubmit: any;
  updateFunc: any;
  validateField: any;
}) {
  const { theme } = useTheme();

  return (
    <>
      <div className="w-full fixed inset-0 h-187.5">
        <MemSideRays theme={theme} />
      </div>

      <Header />

      <main className="pt-25 mx-auto max-w-460 p-4 rounded-t-[30px grid-cols-1 min-[1250px]:grid-cols-4 min-[1250px]:grid-rows-[11rem_20rem_1fr] gap-3 overflow-y-auto scrollbar-thin grid backdrop-blur-xl in-[.dark]:backdrop-blur-[2.2px]">
        <section className="flex flex-wrap gap-3 *:flex-1 *:min-w-56 min-[1250px]:col-span-3">
          {statsChartData.map((sec) => (
            <StatsChart
              chartData={sec.chartData}
              key={sec.title}
              title={sec.title}
            />
          ))}
        </section>
        <section className="border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] min-[1250px]:row-span-2 rounded-2xl [content-visibility:revert!important] flex flex-col p-3 gap-2">
          <CreateTaskForm
            values={formValues}
            dueValue={dueValue}
            errors={errors}
            formError={formError}
            handleDueDateChange={handleDueDateChange}
            mutation={mutation}
            onSubmit={onSubmit}
            updateFunc={updateFunc}
            validateField={validateField}
          />
        </section>
        <section className="border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] min-[1250px]:col-span-3 min-h-80 min-w-0 rounded-2xl">
          <AreaChartComp chartData={areaChartData} />
        </section>
        <section className="border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] min-[1250px]:col-span-4 rounded-2xl">
          <TasksBoard locationSearch={searchEvent?.current ?? ""} />
        </section>
      </main>

      <Footer />
    </>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
