"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UserRoles } from "@/app/_constants/user-roles"
import toasterService from "@/app/_services/toaster-service"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie';
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers"
import { signIn } from "next-auth/react"
import { ErrorCode } from "@/app/_constants/error-codes"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries, ICountry } from "@/app/_constants/countries"

export function SignUpForm({ role, setIsGoogleSignInDisable }: { role: UserRoles, setIsGoogleSignInDisable: (value: boolean) => void; }) {
  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  }).extend(
    role === UserRoles.TESTER ?
      {
        firstName: z.string().min(1, { message: "First name is required" }),
        lastName: z.string().min(1, { message: "Last name is required" }),
        country: z.string().min(1, { message: "Country is required" }),
      } : {}
  );

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultValues = role === UserRoles.CLIENT ?
    {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      country: ""
    } :
    {
      email: "",
      password: "",
    }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startLoading()

    Cookies.set(CookieKey.ROLE, role);
    const response = await signIn(NextAuthProviders.CREDENTIALS, {
      email: values.email, password: values.password, firstName: values.firstName, lastName: values.lastName, country: values.country
      , authIntent: AuthIntent.SIGN_UP_CREDS, redirect: false, callbackUrl: `/auth/sign-up?e=${ErrorCode.ERR_SIGN_UP}`
    });

    if (response?.error) {
      stopLoading();
      toasterService.error(response.error)
    } else {
      router.push('private/dashboard')
    }
  }

  const startLoading = () => {
    setIsLoading(true);
    setIsGoogleSignInDisable(true);
  }

  const stopLoading = () => {
    setIsLoading(false);
    setIsGoogleSignInDisable(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 mt-4 mb-4">

        {role === UserRoles.TESTER &&
          (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className={"flex-[2]"}>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          {field.value}
                          {!field.value ? <SelectValue /> : null}
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
            </>)
        }

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create an account
        </Button>
        <div className="text-center">
          <span className="mr-0">Already have an account?</span>
          <Link href={'/auth/sign-in'}>
            <span className="text-primary ml-2">Sign in!</span>
          </Link>
        </div>
      </form>
    </Form>
  )
}