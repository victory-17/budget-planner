
import { AuthForm } from "@/components/auth/auth-form";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <AuthForm type="signup" />
    </div>
  );
};

export default SignUp;
