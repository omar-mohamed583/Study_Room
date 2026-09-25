import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/components/providers/authProvider";
import GradientWaves from "~/components/ui/GradientWaves";
import InputComponent, { useInputStates } from "~/components/ui/inputField";
import LoadingComponent from "~/components/ui/LoadingComponent";

export default function Login() {
  const navigate = useNavigate();

  const actionObj = {
    login: "Welcome Back",
    register: "Create an Account",
  };

  const [loading, setLoading] = useState<boolean>(false);

  const [name, setName, nameError, setNameError, , nameRef] = useInputStates();
  const [email, setEmail, emailError, setEmailError, , emailRef] =
    useInputStates();
  const [
    password,
    setPassword,
    passwordError,
    setPasswordError,
    ,
    passwordRef,
    seePassword,
    setSeePassword,
  ] = useInputStates();

  const [action, setAction] = useState<"login" | "register">("login");

  const [submitError, setSubmitError] = useState<string | { error: string }>(
    "",
  );

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

      setNameError(false);
      setEmailError(false);
      setPasswordError(false);
      setSubmitError("");
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
        setEmailError(true);
        setPasswordError(true);
      } else if (
        !data.get("email") ||
        !emailRegex.test(String(data.get("email")))
      ) {
        setEmailError(true);
      } else if (!data.get("password")) {
        setEmailError(false);
        setPasswordError(true);
      } else {
        setEmailError(false);
        setPasswordError(false);

        const loginUser = await login(email, password);
        console.log(loginUser);

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
        setNameError(true);
        setEmailError(true);
        setPasswordError(true);
      } else if (!String(data.get("name")).trim()) {
        setNameError(true);
        setEmailError(false);
        setPasswordError(false);
      } else if (
        !data.get("email") ||
        !emailRegex.test(String(data.get("email")))
      ) {
        setNameError(false);
        setEmailError(true);
        setPasswordError(false);
      } else if (!data.get("password")) {
        setNameError(false);
        setEmailError(false);
        setPasswordError(true);
      } else {
        setNameError(false);
        setEmailError(false);
        setPasswordError(false);

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
        turbulence={22}
        tilt={1.11}
        zoom={1.1}
        height={5.5}
        fogDepth={17}
        detail="high"
        brightness={1}
        opacity={1}
        mouseInteraction={false}
        parallaxStrength={0.9}
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
            <InputComponent
              type="name"
              errorText="Invalid username"
              title="Please enter username"
              minLength={2}
              ref={nameRef}
              value={name}
              error={nameError}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <InputComponent
            type="email"
            ref={emailRef}
            value={email}
            error={emailError}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <InputComponent
              type="password"
              errorText="Invalid password, must be 6 characters"
              minLength={6}
              ref={passwordRef}
              seePassword={seePassword}
              setSeePassword={setSeePassword}
              value={password}
              error={passwordError}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                className="text-xs leading-[normal] cursor-pointer text-gray-300"
                type="button"
                onClick={() => navigate("/login/forget-password")}
              >
                Forget Password?
              </button>
            </div>
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
