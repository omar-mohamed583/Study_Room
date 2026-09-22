import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/components/providers/authProvider";
import GradientWaves from "~/components/ui/GradientWaves";
import LoadingComponent from "~/components/ui/LoadingComponent";

export default function Login() {
  const navigate = useNavigate();

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

  const [seePass, setSeePass] = useState<boolean>(false);

  const [submitError, setSubmitError] = useState<string | { error: string }>("");

  const nameContRef = useRef<null | HTMLDivElement>(null);

  const { register, login, isLoading } = useAuth();

  useEffect(() => {
    document.body.classList.add("dark");
    document.body.style.paddingBlock = "0px";
  }, []);

  function handleChangeAction() {
    setLoading(true);

    setTimeout(() => {
      setAction(action === "login" ? "register" : "login");

      nameContRef?.current?.classList.toggle("hidden", action === "register");

      setError({ name: false, email: false, password: false });
      setSubmitError("")
    }, 500);

    setTimeout(() => setLoading(false), 1000);
  }

  async function handleFormSubmission(e: any) {
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
        setError({ name: false, email: false, password: false });

        const loginUser = await login(email, password);
        console.log(loginUser)
        if (loginUser?.error) {
          setSubmitError(loginUser?.error);

          setTimeout(() => {
            setSubmitError("");
          }, 3000);

        } else {
          navigate("/");
        }
      }
      // Handle Register Logic Here
    } else {
      if (
        !data.get("email") &&
        !data.get("password") &&
        !String(data.get("name")).trim()
      ) {
        setError({
          name: true,
          email: true,
          password: true,
        });
      } else if (!String(data.get("name")).trim()) {
        setError(() => ({ name: true, email: false, password: false }));
      } else if (
        !data.get("email") ||
        !emailRegex.test(String(data.get("email")))
      ) {
        setError(() => ({ name: false, email: true, password: false }));
      } else if (!data.get("password")) {
        setError(() => ({ name: false, email: false, password: true }));
      } else {
        setError({ name: false, email: false, password: false });

        const registerUser = await register(name, email, password);
        console.log(registerUser);

        if (registerUser?.error) {
          setSubmitError(registerUser.error);
          setTimeout(() => {
            setSubmitError("");
          }, 3000);
        } else {
          navigate("/");
        }
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

      <p
        className={`absolute [position-anchor:--anc] bottom-[calc(anchor(top)-16px)] left-[anchor(left)] w-[anchor-size(width)] -z-10 pb-7 pt-3 rounded-t-3xl submit-error text-red-400 font-bold text-center bg-red-500/15 backdrop-blur-xl transition-[translate,opacity] duration-200 ${submitError ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        {typeof submitError === "string" ? submitError : submitError.error}
      </p>

      <form
        onSubmit={handleFormSubmission}
        className="grid relative [anchor-name:--anc] z-10 gap-4 bg-black/15 min-h-[50vh] p-5 py-7 sm:p-8 rounded-3xl backdrop-blur-lg w-[min(28rem,90vw)] border border-white/10 isolation-auto"
      >
        <legend className="text-2xl font-black text-center mb-5">
          {actionObj[`${action}`]}
        </legend>

        <div className="flex flex-col gap-3">
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
                className={`peer focus:outline-none p-2 border-b  w-full text-[15px] ${error.name ? "border-b-red-500" : "border-b-white"}`}
              />
              <label
                htmlFor="name"
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${error.name ? "text-red-500" : "text-gray-400"}
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:scale-80 peer-focus:left-0
              peer-not-placeholder-shown:left-0
              peer-not-placeholder-shown:scale-80
              peer-not-placeholder-shown:-top-0.5 flex gap-2 items-center content-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-type"
                >
                  <path d="M12 4v16" />
                  <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                  <path d="M9 20h6" />
                </svg>
                Username
              </label>
            </div>
            <span
              className={`text-[13px] text-red-500 font-medium ${!error.name && "opacity-0"} transition-opacity`}
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
                className={`peer focus:outline-none p-2 border-b  w-full text-[15px] ${error.email ? "border-b-red-500" : "border-b-white"}`}
              />
              <label
                htmlFor="email"
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${error.email ? "text-red-500" : "text-gray-400"}
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:scale-80 peer-focus:left-0
              peer-not-placeholder-shown:left-0
              peer-not-placeholder-shown:scale-80
              peer-not-placeholder-shown:-top-0.5 flex gap-2 items-center content-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail"
                >
                  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                  />
                </svg>
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
                type={seePass ? "text" : "password"}
                minLength={6}
                aria-autocomplete="list"
                autoComplete="current-password"
                placeholder=" "
                title="Please enter your password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`peer focus:outline-none p-2 border-b  w-full text-[15px] ${error.password ? "border-b-red-500" : "border-b-white"}`}
              />
              <label
                htmlFor="password"
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${error.password ? "text-red-500" : "text-gray-400"}
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:scale-80 peer-focus:left-0
              peer-not-placeholder-shown:left-0
              peer-not-placeholder-shown:scale-80
              peer-not-placeholder-shown:-top-0.5 flex gap-2 items-center content-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock-keyhole"
                >
                  <circle
                    cx="12"
                    cy="16"
                    r="1"
                  />
                  <rect
                    x="3"
                    y="10"
                    width="18"
                    height="12"
                    rx="2"
                  />
                  <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                </svg>
                Password
              </label>
              <button
                type="button"
                className={`cursor-pointer absolute right-1.5 top-1/2 -translate-y-1/2 grid *:[grid-area:stack] *:[grid-template-areas:'stack'] ${seePass ? "[&>svg:first-child]:opacity-0" : "[&>svg:last-child]:opacity-0"} *:transition-opacity duration-75`}
                onClick={() => setSeePass((prev) => !prev)}
              >
                {/* Opened Eye */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>

                {/* Closed Eye */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye-off"
                >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                  <path d="m2 2 20 20" />
                </svg>
              </button>
            </div>
            <span
              className={`email-error text-[13px] text-red-500 font-medium ${!error.password && "opacity-0"} transition-opacity`}
            >
              Invalid password, must be 6 characters
            </span>
          </div>
        </div>

        <div
          className={`flex ${action === "login" ? "flex-col" : "flex-col-reverse"} gap-1 [&>button]:cursor-pointer [&>button]:p-2 *:rounded-xl *:w-full [&>button]:hover:brightness-70 *:transition-all duration-200 *:disabled:brightness-50 *:disabled:hover:brightness-50 *:disabled:cursor-auto`}
        >
          <button
            className="bg-(--accent-200)"
            disabled={isLoading}
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
            disabled={isLoading}
            type={action === "register" ? "submit" : "button"}
            onClick={action === "register" ? () => null : handleChangeAction}
          >
            Create Account
          </button>
        </div>
      </form>

      <LoadingComponent loading={!(loading || isLoading)} />
    </main>
  );
}
