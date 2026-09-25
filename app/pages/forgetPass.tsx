import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  type LinksFunction,
  type MetaFunction,
} from "react-router";
import { useAuth } from "~/components/providers/authProvider";
import GradientWaves from "~/components/ui/GradientWaves";
import InputComponent, { useInputStates } from "~/components/ui/inputField";
import LoadingComponent from "~/components/ui/LoadingComponent";
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
  const navigate = useNavigate();
  const [email, setEmail, emailError, setEmailError, emailId, emailRef] =
    useInputStates();
  const [otp, setOtp, otpError, setOtpError, otpId, otpRef] = useInputStates();
  const [
    password,
    setPassword,
    passwordError,
    setPasswordError,
    passwordId,
    passwordRef,
    seePassword,
    setSeePassword,
  ] = useInputStates();
  const [
    confirmPass,
    setConfirmPass,
    confirmPassError,
    setConfirmPassError,
    confirmPassId,
    confirmPassRef,
  ] = useInputStates();

  const steps = useMemo(
    () => [
      {
        title: "Insert Email",
        id: crypto.randomUUID(),
        content: (
          <div
            className="grid gap-6"
            key={emailId}
          >
            <h3 className="text-center md:text-xl leading-[normal] font-medium">
              Insert your email to send OTP
            </h3>
            <InputComponent
              className="self-center"
              type="email"
              ref={emailRef}
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
          <div
            className="grid gap-6"
            key={otpId}
          >
            <h3 className="text-center md:text-xl leading-[normal] font-medium">
              Enter The OTP Sent To Your Email
            </h3>
            <InputComponent
              maxLength={6}
              ref={otpRef}
              type="otp"
              error={otpError}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        ),
      },
      {
        title: "Reset Password",
        id: crypto.randomUUID(),
        content: (
          <div
            className="grid gap-4"
            key={passwordId + confirmPassId}
          >
            <h3 className="text-center md:text-xl leading-[normal] font-medium">
              Change Your Password
            </h3>
            <InputComponent
              type="password"
              seePassword={seePassword}
              setSeePassword={setSeePassword}
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
      seePassword,
    ],
  );

  const [validSteps, setValidSteps] = useState<number[]>([]);

  const {
    requestOtp,
    resendOtp,
    verifyOtp,
    resetPassword,
    isLoading,
    setResetPassSuccess,
  } = useAuth();

  const [submitError, setSubmitError] = useState<string | { error: string }>(
    "",
  );

  const [resetToken, setResetToken] = useState<string>("");

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
        break;
      case "email":
        setEmailError(true);
        break;
      case "otp":
        setOtpError(true);
        break;
      case "password":
        setPasswordError(true);
        setConfirmPassError(true);
        break;
      default:
        console.log("Not Found Type");
    }
  }

  async function handleInputsSubmission(name: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    switch (name) {
      case "email": {
        if (!email || !email.match(emailRegex)) {
          SetErrorStates("email");
          return false;
        }

        const otpMessage = await requestOtp(email);
        console.warn(otpMessage);

        if (otpMessage?.error) {
          setSubmitError(otpMessage.error);
          setTimeout(() => setSubmitError(""), 3000);
          return false;
        }

        return true;
      }

      case "otp resend": {
        const otpResendMessage = await resendOtp(email);
        console.warn(otpResendMessage);

        if (otpResendMessage?.error) {
          setSubmitError(otpResendMessage.error);
          setTimeout(() => setSubmitError(""), 3000);
          return false;
        }

        return false;
      }

      case "otp verify": {
        if (!otp || otp.length < 6) {
          SetErrorStates("otp");
          return false;
        }

        const verifiedOtp = await verifyOtp(email, otp);
        console.warn(verifiedOtp);

        if (verifiedOtp?.error) {
          setSubmitError(verifiedOtp.error);
          setTimeout(() => setSubmitError(""), 3000);
          SetErrorStates("otp");
          return false;
        }

        setResetToken(verifiedOtp.resetToken);
        console.warn(resetToken);
        return true;
      }

      case "password": {
        if (!password || password.length < 6) {
          SetErrorStates("password");
          return false;
        }

        if (password !== confirmPass) {
          setConfirmPassError(true);
          setSubmitError("Password doesn't match password confirmation");
          setTimeout(() => setSubmitError(""), 3000);
          return false;
        }

        console.log(resetToken);
        const changeResult = await resetPassword(
          resetToken,
          password,
          confirmPass,
        );

        console.warn(changeResult);

        if (changeResult?.error) {
          setSubmitError(changeResult.error);
          setTimeout(() => setSubmitError(""), 3000);
          return false;
        }

        setResetPassSuccess(true);
        navigate("/login");
      }

      default:
        console.log("Not Found Type");
        return false;
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
        action=""
        className="grid relative [anchor-name:--anc] z-10 gap-2 bg-black/10 h-max md:h-100 p-3 sm:p-8 rounded-3xl backdrop-blur-lg w-[min(35rem,90vw)] border border-white/10"
      >
        <Stepper
          stepsArray={steps}
          validSteps={validSteps}
          setValidSteps={setValidSteps}
          validationFunction={handleInputsSubmission}
        />
      </form>

      <LoadingComponent loading={!isLoading} />
    </main>
  );
}
