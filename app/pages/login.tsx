import { useEffect, useRef, useState, useActionState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { useAuth } from "~/components/providers/authProvider";
import GradientWaves from "~/components/ui/GradientWaves";
import useTheme from "~/context/themeContext";

export default function Login() {
  const actionObj = {
    login: "Welcome Back",
    register: "Create an Account",
  };



  const [loading, setLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");

  const [name, setName] = useState<string>("");

  const [error, setError] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [action, setAction] = useState<"login" | "register">("login");

  const nameContRef = useRef<null | HTMLDivElement>(null);

  const { theme } = useTheme();

  const { register, login, isLoading } = useAuth();

  useEffect(() => {
    document.body.classList.add(theme);
  }, []);

  function handleChangeAction() {
    setLoading(true);

    setTimeout(() => {
      setAction(action === "login" ? "register" : "login");

      nameContRef?.current?.classList.toggle("hidden", action === "register");

      setError({ name: false, email: false, password: false });
    }, 500);

    setTimeout(() => setLoading(false), 1000);
  }

  function handleFormSubmission(e: any) {
    e.preventDefault();

    const data = new FormData(e.target);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!data) return;

    // Handle login logic
    if (action === "login") {

      if (!data.get("email") && !data.get("password")) {
        setError((prev) => ({
          ...prev,
          email: true,
          password: true,
        }));

      } else if (
        !data.get("email") ||
        !emailRegex.test(String(data.get("email")))
      ) {
        setError((prev) => ({ ...prev, email: true }));

      } else if (!data.get("password")) {
        setError((prev) => ({ ...prev, email: false, password: true }));

      } else {
        setLoading(true);
        setError({ name: false, email: false, password: false });

        login(email, password);
      }

    // Handle Register Logic Here
    } else {

      if (!data.get("email") && !data.get("password") && !data.get("name")) {
        setError({
          name: true,
          email: true,
          password: true,
        });

      } else if (!data.get("name")) {
        setError((prev) => ({ ...prev, name: true }));

      } else if (
        !data.get("email") ||
        !emailRegex.test(String(data.get("email")))
      ) {
        setError((prev) => ({ ...prev, email: true }));

      } else if (!data.get("password")) {
        setError(() => ({ name: false, email: false, password: true }));

      } else {
        setLoading(true);
        setError({ name: false, email: false, password: false });

        register(name, email, password);
      }
    }
  }

  return (
    <main className="grid place-content-center min-h-screen">
      <GradientWaves
        horizonColor="#0032e6"
        waveColor="#ff7452"
        crestColor="#FFFFFF"
        speed={0.4}
        amplitude={2.5}
        waveScale={0.6}
        waveRatio={0.9}
        swell={35}
        turbulence={20}
        tilt={1.11}
        zoom={1.1}
        height={5.5}
        fogDepth={15}
        detail="high"
        brightness={1}
        opacity={1}
        mouseInteraction={false}
        parallaxStrength={0.8}
        grain
        grainIntensity={0.05}
      />

      <form
        onSubmit={handleFormSubmission}
        className="grid relative z-10 gap-6 bg-black/15 min-h-[50vh] p-5 py-7 sm:p-8 rounded-3xl backdrop-blur-lg w-[min(28rem,80vw)] border border-white/10"
      >
        <legend className="text-2xl font-black text-center mb-5">
          {actionObj[`${action}`]}
        </legend>

        <div className="flex flex-col gap-1">
          <div
            ref={nameContRef}
            className="hidden not-[.hidden]:flex flex-col gap-1.5"
          >
            <div className="relative">
              <input
                id="name"
                aria-autocomplete="list"
                type="name"
                autoComplete="name"
                placeholder=" "
                minLength={2}
                name="name"
                title="Please enter username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer focus:outline-none p-2 border-b border-b-white w-full text-[15px]"
              />
              <label
                htmlFor="name"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:text-xs peer-focus:left-2.5
              peer-not-placeholder-shown:left-2.5
              peer-not-placeholder-shown:text-xs
              peer-not-placeholder-shown:-top-0.5"
              >
                Username
              </label>
            </div>
            <span
              className={`email-error text-[13px] text-red-500 font-medium ${!error.email && "opacity-0"} transition-opacity`}
            >
              Invalid username
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <input
                id="email"
                aria-autocomplete="list"
                type="email"
                autoComplete="email"
                placeholder=" "
                name="email"
                title="Please enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer focus:outline-none p-2 border-b border-b-white w-full text-[15px]"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:text-xs peer-focus:left-2.5
              peer-not-placeholder-shown:left-2.5
              peer-not-placeholder-shown:text-xs
              peer-not-placeholder-shown:-top-0.5"
              >
                Email
              </label>
            </div>
            <span
              className={`email-error text-[13px] text-red-500 font-medium ${!error.email && "opacity-0"} transition-opacity`}
            >
              Invalid email
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <input
                id="password"
                type="password"
                minLength={6}
                aria-autocomplete="list"
                autoComplete="current-password"
                placeholder=" "
                title="Please enter your password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer focus:outline-none p-2 border-b border-b-white w-full text-[15px]"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:text-xs peer-focus:left-2.5
              peer-not-placeholder-shown:left-2.5
              peer-not-placeholder-shown:text-xs
              peer-not-placeholder-shown:-top-0.5"
              >
                Password
              </label>
            </div>
            <span
              className={`email-error text-[13px] text-red-500 font-medium ${!error.password && "opacity-0"} transition-opacity`}
            >
              Invalid password, must be 6 characters
            </span>
          </div>
        </div>

        <div
          className={`flex ${action === "login" ? "flex-col" : "flex-col-reverse"} gap-1 [&>button]:cursor-pointer [&>button]:p-2 *:rounded-xl *:w-full [&>button]:hover:brightness-70 *:transition-all duration-200`}
        >
          <button
            className="bg-(--accent-200)"
            type={action === "login" ? "submit" : "button"}
            onClick={action === "login" ? () => null : handleChangeAction}
          >
            Sign in
          </button>
          <div className="flex items-center gap-3 px-1 py-1 text-sm text-white/70">
            <span className="h-px flex-1 bg-white/30" />
            <span className="font-medium tracking-[0.15em]">or</span>
            <span className="h-px flex-1 bg-white/30" />
          </div>
          <button
            className="bg-black"
            type={action === "register" ? "submit" : "button"}
            onClick={action === "register" ? () => null : handleChangeAction}
          >
            Create Account
          </button>
        </div>
      </form>

      <div
        className={`loading h-screen w-screen fixed top-0 left-0 bg-black/80 place-content-center place-items-center z-999 backdrop-blur-2xl invisible opacity-0 ${(loading || isLoading) && "opacity-100 visible"} duration-75 transition-opacity`}
      >
        <div className="flex flex-col items-center gap-2 tracking-wider text-sm">
          <ThinkingOrb
            state="solving"
            size={64}
          />
          Hang Tight...
        </div>
      </div>
    </main>
  );
}
