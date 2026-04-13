// Named exports for all pages
export { default as Dashboard } from "./Dashboard";
export { default as ForgotPassword } from "./ForgotPassword";
export { default as Index } from "./Index";
export { default as Login } from "./Login";
export { default as NotFound } from "./NotFound";
export { default as PrivacyPolicy } from "./PrivacyPolicy";
export { default as ProfileSettings } from "./ProfileSettings";
export { default as ResetPassword } from "./ResetPassword";
export { default as Signup } from "./Signup";
export { default as TermsOfService } from "./TermsOfService";

// Direct re-export of Index as default (no initialization issue)
export { default } from "./Index";
