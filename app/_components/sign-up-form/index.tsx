"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserRoles } from "@/app/_constants/user-roles";
import toasterService from "@/app/_services/toaster-service";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { signIn } from "next-auth/react";
import { ErrorCode } from "@/app/_constants/error-codes";
import Link from "next/link";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, ICountry } from "@/app/_constants/countries";
import { NewBrandLogo } from "../brand-logo";
import { Loader2 } from "lucide-react";

export function SignUpForm({
  role,
  setIsGoogleSignInDisable,
}: {
  role: UserRoles;
  setIsGoogleSignInDisable: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const isClientPage = pathname === "/auth/sign-up";

  const formSchema = isClientPage
    ? z.object({
        email: z
          .string()
          .email({ message: "Please enter a valid email address" }),

        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters" }),

        firstName: z.string().min(1, { message: "First name is required" }),

        lastName: z.string().min(1, { message: "Last name is required" }),

        country: z
          .string()
          .min(1, { message: "Please select country" })
          .optional(),

        userCount: z.string().optional(),
        companyName: z.string().min(1, { message: "Company name is required" }),
      })
    : z.object({
        email: z
          .string()
          .email({ message: "Please enter a valid email address" }),

        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters" }),

        firstName: z.string().min(1, { message: "First name is required" }),

        lastName: z.string().min(1, { message: "Last name is required" }),

        country: z
          .string()
          .min(1, { message: "Please select country" })
          .optional(),

        companyName: z.string().optional(),
      });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultValues = isClientPage
    ? {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        country: "",
        userCount: "",
        companyName: "",
      }
    : {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        country: "",
        companyName: "",
      };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startLoading();

    Cookies.set(CookieKey.ROLE, role);
    const response = await signIn(NextAuthProviders.CREDENTIALS, {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      country: values.country,
      authIntent: AuthIntent.SIGN_UP_CREDS,
      redirect: false,
      callbackUrl: `/auth/sign-up?e=${ErrorCode.ERR_SIGN_UP}`,
    });

    if (response?.error) {
      stopLoading();
      toasterService.error(response.error);
    } else {
      router.push("private/dashboard");
    }
  }

  const startLoading = () => {
    setIsLoading(true);
    setIsGoogleSignInDisable(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setIsGoogleSignInDisable(false);
  };

  const brands = [
    { name: "AUDIT360", logo: "/assets/images/audit360.png", isWhite: true },
    { name: "MERCER", logo: "/assets/images/Mercer.png", isWhite: false },
    {
      name: "ENCollect",
      logo: "/assets/images/Enterprise.png",
      isWhite: false,
    },
    { name: "OKTO", logo: "/assets/images/OKTO.png", isWhite: false },
  ];

  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <>
    <div className="min-h-screen flex flex-col lg:flex-row px-4 py-8 lg:py-0">
      {/* left side — Only visible on large screen */}
      <div className="hidden lg:flex lg:w-1/2 px-10 py-5 flex-col justify-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Get Started with QTM - Quality Test Manager
        </h1>
        <p className="text-gray-700 mb-4 text-base">
          <b>Simplify Your Test Management. Accelerate Your Releases</b>
          <br />
          Create your free account and experience seamless test planning,
          execution, and issue tracking — all in one place.
        </p>
        <ul className="text-gray-700 space-y-3 mb-10 text-sm">
          <li>✅ Easy to Use & Intuitive Dashboard</li>
          <li>✅ End-to-End Test Lifecycle Management</li>
          <li>✅ Requirement to Defect Traceability (RTM)</li>
          <li>✅ Real-time Reports & Metrics</li>
          <li>✅ Scalable for Teams of All Sizes</li>
        </ul>
        <p className="text-sm text-gray-600 mb-4">
          Trusted by over 100+ QA teams
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="w-24 flex items-center justify-center"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className={`h-16 object-contain ${
                  brand.isWhite ? "invert" : ""
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (Form section) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center pt-8">
        <div className="w-full max-w-xl bg-white lg:bg-green-100 md:lg-bg-green-100 rounded-2xl shadow-xl p-6 md:m-6">
          <h1 className="text-2xl font-bold text-center mb-2">
            {role === UserRoles.TESTER
              ? "Sign up as Tester"
              : role === UserRoles.CLIENT
              ? "Sign up as Client"
              : "Sign Up"}
          </h1>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
            Get Started
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            30-day free trial. No credit card required.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Company & Country (Client only) */}
              {isClientPage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="companyName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Company name"
                            className="bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="country"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem
                                  key={c.description}
                                  value={c.description}
                                >
                                  {c.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Country for non-client */}
              {!isClientPage && (
                <FormField
                  name="country"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem
                                key={c.description}
                                value={c.description}
                              >
                                {c.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Team Size */}
              {isClientPage && (
                <FormField
                  name="userCount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="How many users will access? *" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5+">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-1 accent-green-600"
                />
                <label htmlFor="agreement">
                  I agree to the{" "}
                  <Link
                    href="https://apptestify.com/qtm-terms-and-conditions"
                    className="text-green-600 "
                    target="_blank"
                  >
                    terms of use
                  </Link>
                  ,{" "}
                  <Link
                    href="https://apptestify.com/qtm-terms-and-conditions"
                    className="text-green-600 "
                    target="_blank"
                  >
                    non-disclosure agreement
                  </Link>
                    {" "}and{" "}
                  <Link
                    href="https://apptestify.com/qtm-privacy-policy"
                    className="text-green-600"
                    target="_blank"
                  >
                    privacy policy
                  </Link>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!isAgreed || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
              </Button>
              <div className="text-center text-sm sm:text-base">
                <span>Already have an account? </span>
                <Link href="/auth/sign-in">
                  <span className="ml-2 text-green-600">Sign In!</span>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
    <div className="text-center text-[10px]  md:text-xs text-gray-500 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 px-5">
        <p>
          &copy; 2025 AppTestify Global Services Pvt. Ltd. • Built with care in
          India
        </p>
        <div className="flex flex-wrap items-center gap-x-4 text-green-600">
          <Link
            href="https://apptestify.com/qtm-privacy-policy"
            target="_blank"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="https://apptestify.com/qtm-terms-and-conditions"
            target="_blank"
          >
            Terms of Use
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="https://apptestify.com/#contact" target="_blank">
            Contact Us
          </Link>
        </div>
        {/* <span className="hidden sm:inline mx-2"></span> */}
        <p>QTM is a product of AppTestify Global Services Pvt. Ltd.</p>
      </div>
      </>
  );
}
