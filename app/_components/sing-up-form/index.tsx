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
import { Loader2 } from "lucide-react";
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
    console.log("Form Data", values);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-green-50 px-4">
      {/* Left Section */}
      <div className="md:w-1/2 w-full px-4 md:px-10 flex flex-col justify-center">
        <NewBrandLogo className="mb-6" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Get Started with QTM - Quality Test Manager
        </h1>
        <p className="text-gray-700 mb-4 text-base">
          <b>Simplify Your Test Management. Accelerate Your Releases</b> <br />{" "}
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
        <p className="text-sm text-gray-600">Trusted by over 100+ QA teams</p>
        <div className="flex flex-wrap gap-4 items-center">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex flex-col items-center w-28 bg-transparent"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className={`w-28 h-28 object-contain ${
                  brand.isWhite ? "invert" : ""
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Section (Form Card) */}
      <div className="md:w-1/2 w-full flex justify-center items-center p-6">
        <div className="w-full max-w-xl bg-green-100 rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            {role === UserRoles.TESTER
              ? "Sign up as Tester"
              : role === UserRoles.CLIENT
              ? "Sign up as Client"
              : "Sign Up"}
          </h1>
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex justify-center">
            Get Started
          </h2>
          <p className="text-sm text-gray-600 mb-6 flex justify-center">
            30-day free trial. No credit card required.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white"
                          placeholder="First name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white"
                          placeholder="Last name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white"
                          placeholder="name@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white"
                          placeholder="Enter password"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Company Name (Client only) */}
              {isClientPage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-white"
                            placeholder="Company name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Country (Shown on both pages) */}
                  <FormField
                    control={form.control}
                    name="country"
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
                              {countries.map((country: ICountry) => (
                                <SelectItem
                                  key={country.description}
                                  value={country.description}
                                >
                                  {country.description}
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

              {/* Country only (if not Client) */}
              {!isClientPage && (
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
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
                              {countries.map((country: ICountry) => (
                                <SelectItem
                                  key={country.description}
                                  value={country.description}
                                >
                                  {country.description}
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
              {/* Team Size (Client only) */}
              {isClientPage && (
                <div>
                  <FormField
                    control={form.control}
                    name="userCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {/* How many users will access?
                          <span className="text-red-500">*</span> */}
                        </FormLabel>
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
                </div>
              )}
              {/* Submit */}
              <Button
                type="submit"
                className="w-fulll flex justify-center"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
