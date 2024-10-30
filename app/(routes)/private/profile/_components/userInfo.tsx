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
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { StorageKey } from "@/app/_constants/localstorage-keys";
import { IUserInfoData } from "@/app/_interface/tester";
import { countries } from "../../../../_constants/countries";
import { states } from "../../../../_constants/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProfileSchema = z.object({
  Firstname: z.string().nonempty({
    message: "Required",
  }),
  Lastname: z.string().nonempty({
    message: "Required",
  }),
  Street: z.string().nonempty({
    message: "Required",
  }),
  City: z.string().nonempty({
    message: "Required",
  }),
  PostalCode: z
    .string()
    .length(6, { message: "Required" })
    .regex(/^\d{6}$/, { message: "Numbers only." }),
  Country: z.string().nonempty({ message: "Required." }),
  State: z.string().nonempty({ message: "Required." }),
});

export default function UserInfo() {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<IUserInfoData | null>(null);
  const [initialValues, setInitialValues] = useState<{
    Firstname: string;
    Lastname: string;
  } | null>(null);
  const [filteredStates, setFilteredStates] = useState<any[]>([]);

  const profileForm = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      Firstname: "",
      Lastname: "",
    },
  });

  useEffect(() => {
    const storedData = localStorage.getItem(StorageKey.PRINCIPAL_USER);

    if (storedData) {
      const data = JSON.parse(storedData);

      // for testing purpose
      // const data = {
      //   _id: "6715e3e235b1aedadfb7d88e",
      //   email: "saurabh@excitesys.com",
      //   firstName: "abc",
      //   lastName: "dummy",
      //   role: "TESTER",
      //   createdAt: "2024-10-21T05:17:22.088Z",
      //   updatedAt: "2024-10-21T05:17:22.088Z",
      //   __v: 0,
      // };
      setParsedData(data);

      setInitialValues({
        Firstname: data.firstName || "",
        Lastname: data.lastName || "",
      });
      profileForm.reset({
        Firstname: data.firstName || "",
        Lastname: data.lastName || "",
      });
    }
  }, [profileForm]);

  function onProfileSubmit(data: z.infer<typeof ProfileSchema>) {
    console.log("Profile Info:", data);
  }

  const getInputFeildsEnable = (
    parsedData: IUserInfoData | null,
    isEdit: boolean
  ) => {
    if (parsedData && parsedData.firstName && parsedData.lastName && !isEdit) {
      return true;
    }
    return false;
  };

  const handleCancel = () => {
    setIsEdit(false);
    if (initialValues) {
      profileForm.reset(initialValues);
    }
  };

  function handleCountryChange(countryId: string) {
    profileForm.setValue("Country", countryId);
    const filteredStates = states.filter(
      (state) => state.countryId === countryId
    );
    setFilteredStates(filteredStates);
    profileForm.setValue("State", "");
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* User Info Section */}
        <div className="col-span-12">
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-6"
            >
              <div className="flex space-x-6">
                <FormField
                  control={profileForm.control}
                  name="Firstname"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="text-sm">
                        First Name <span className="text-red-500">*</span>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly={getInputFeildsEnable(parsedData, isEdit)}
                          disabled={getInputFeildsEnable(parsedData, isEdit)}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 font-thin " />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="Lastname"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <div className="text-sm">
                        Last Name <span className="text-red-500">*</span>
                      </div>
                      <FormControl>
                        <Input
                          // placeholder="Last Name"
                          {...field}
                          readOnly={getInputFeildsEnable(parsedData, isEdit)}
                          disabled={getInputFeildsEnable(parsedData, isEdit)}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 font-thin" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-12">
                <div className="flex-1">
                  <FormField
                    control={profileForm.control}
                    name="Street"
                    render={({ field }) => (
                      <FormItem>
                        <div className="text-sm">
                          Street <span className="text-red-500">*</span>
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex-1">
                  <FormField
                    control={profileForm.control}
                    name="City"
                    render={({ field }) => (
                      <FormItem>
                        <div className="text-sm">
                          City <span className="text-red-500">*</span>
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex-1">
                  <FormField
                    control={profileForm.control}
                    name="PostalCode"
                    render={({ field }) => (
                      <FormItem>
                        <div className="text-sm">
                          Postal Code <span className="text-red-500">*</span>
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex space-x-12 mt-6">
                <div className="flex-1">
                  <FormField
                    control={profileForm.control}
                    name="Country"
                    render={({ field }) => (
                      <FormItem>
                        <div className="text-sm">
                          Country <span className="text-red-500">*</span>
                        </div>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={(value) =>
                              handleCountryChange(value)
                            }
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem
                                  key={country._id}
                                  value={country.masterId}
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

                <div className="flex-1">
                  <FormField
                    control={profileForm.control}
                    name="State"
                    render={({ field }) => (
                      <FormItem>
                        <div className="text-sm">
                          State <span className="text-red-500">*</span>
                        </div>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={filteredStates?.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredStates.map((state) => (
                                <SelectItem
                                  key={state._id}
                                  value={state.description}
                                >
                                  {state.description}
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

                {/* <div className="flex-1 flex items-end justify-end">
                  <Button type="submit">Save</Button>
                </div> */}
              </div>

              {/* Button     */}
              <div className="flex justify-end space-x-4">
                <Button type="submit">Save</Button>
                {/* {parsedData?.firstName && parsedData?.lastName && !isEdit && (
                  <Button type="button" onClick={() => setIsEdit(true)}>
                    Edit
                  </Button>
                )} */}

                {/* {isEdit && (
                  <>
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </>
                )} */}

                {/* {(!parsedData?.firstName || !parsedData?.lastName) &&
                  !isEdit && <Button type="submit">Save</Button>} */}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
