import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2b2b2b] p-4">
      <div className="w-full max-w-3xl bg-[#212121] p-8 rounded-2xl shadow-xl">
        <form className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create Account</h1>
            <p className="text-gray-400 text-lg">
              Already have an account?{" "}
              <Link className="text-[#d57a43] hover:text-[#c16736] font-medium transition-colors" href="/sign-in">
                Sign in
              </Link>
            </p>
          </div>

          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-300 text-base">Email</Label>
              <Input 
                name="email" 
                placeholder="you@example.com" 
                required 
                className="w-full p-4 bg-[#2b2b2b] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#d57a43] focus:border-[#d57a43] outline-none text-white placeholder-gray-500 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-300 text-base">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                minLength={6}
                required
                className="w-full p-4 bg-[#2b2b2b] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#d57a43] focus:border-[#d57a43] outline-none text-white placeholder-gray-500 text-lg"
              />
            </div>

            <SubmitButton 
              formAction={signUpAction} 
              pendingText="Signing up..."
              className="w-full py-4 bg-[#d57a43] text-white rounded-lg hover:bg-[#c16736] transition-colors text-xl font-medium"
            >
              Sign up
            </SubmitButton>

            <FormMessage message={searchParams} />
          </div>
        </form>
        <SmtpMessage />
      </div>
    </div>
  );
}
