import { useEffect, useMemo, useState } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import GradientWaves from "~/components/ui/GradientWaves";
import InputComponent, { useInputStates } from "~/components/ui/inputField";
import Stepper from "~/components/ui/stepper";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "../assets/logo.svg",
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Forget Password",
  },
  {
    name: "",
    content: "",
  },
];

export default function ForgetPassword() {
  const [email, setEmail, emailError, setEmailError, emailId, emailRef] =
    useInputStates();
  const [otp, setOtp, otpError, setOtpError, otpId, otpRef] = useInputStates();
  const [password, setPassword, passwordError, setPasswordError, passwordId, passwordRef] =
    useInputStates();
  const [
    confirmPass,
    setConfirmPass,
    confirmPassError,
    setConfirmPassError,
    confirmPassId,
    confirmPassRef
  ] = useInputStates();

  const steps = useMemo(
    () => [
      {
        title: "Insert Email",
        id: crypto.randomUUID(),
        content: (
          <div className="grid gap-6">
            <h3 className="text-center md:text-xl leading-[normal] font-medium ">Insert your email to send OTP</h3>
            <InputComponent
              className="self-center"
              type="email"
              ref={emailRef}
              key={emailId}
              error={emailError}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        ),
      },
      {
        title: "Enter OTP",
        id: crypto.randomUUID(),
        content: (
          <InputComponent
            maxLength={6}
            key={otpId}
            ref={otpRef}
            type="otp"
            error={otpError}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        ),
      },
      {
        title: "Reset Password",
        id: crypto.randomUUID(),
        content: (
          <div className="grid gap-4">
            <InputComponent
              key={passwordId}
              type="password"
              ref={passwordRef}
              error={passwordError}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputComponent
              type="confirm password"
              key={confirmPassId}
              ref={confirmPassRef}
              error={confirmPassError}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
        ),
      },
    ],
    [
      email,
      password,
      otp,
      confirmPass,
      emailError,
      passwordError,
      otpError,
      confirmPassError,
      emailRef,
      passwordRef,
      otpRef,
      confirmPassRef,
    ],
  );

  const validSteps = new Set<number>();

  const [submitError, setSubmitError] = useState<string | { error: string }>(
    "",
  );

  useEffect(() => {
    document.body.classList.add("dark");
    document.body.style.paddingBlock = "0px";
  }, []);

  function SetErrorStates(type: string) {
    switch (type) {
      case "all":
        setEmailError(true);
        setOtpError(true);
        setPasswordError(true);
        setConfirmPassError(true);
        return;
      case "email":
        setEmailError(true);
        return;
      case "otp":
        setOtpError(true);
        return;
      case "password":
        setPasswordError(true);
        setConfirmPassError(true);
        return;
      default:
        console.log("Not Found Type");
    }
  }

  async function handleFormSubmission(name) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if ()
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

      <form
        onSubmit={handleFormSubmission}
        action=""
        className="grid relative z-10 gap-2 bg-black/10 min-h-[47vh] p-3 sm:p-8 rounded-3xl backdrop-blur-lg w-[min(35rem,90vw)] border border-white/10"
      >
        <Stepper
          stepsArray={steps}
          validSteps={validSteps}
        />
      </form>
    </main>
  );
}
