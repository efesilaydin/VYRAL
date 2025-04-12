import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2b2b2b] p-4">
      <form className="w-full max-w-3xl bg-[#212121] p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
          <p className="text-gray-400 text-lg">
            Don't have an account?{" "}
            <Link className="text-[#d57a43] hover:text-[#c16736] font-medium transition-colors" href="/sign-up">
              Sign up
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-gray-300 text-base">Password</Label>
              <Link
                className="text-base text-[#d57a43] hover:text-[#c16736] transition-colors"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              required
              className="w-full p-4 bg-[#2b2b2b] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#d57a43] focus:border-[#d57a43] outline-none text-white placeholder-gray-500 text-lg"
            />
          </div>

          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full py-4 bg-[#d57a43] text-white rounded-lg hover:bg-[#c16736] transition-colors text-xl font-medium"
          >
            Sign in
          </SubmitButton>

          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
