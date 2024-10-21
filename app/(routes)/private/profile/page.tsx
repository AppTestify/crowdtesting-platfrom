// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// // import { toast } from "@/components/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useEffect, useState } from "react";
// import { StorageKey } from "@/app/_constants/localstorage-keys";
// import { IAddressData } from "@/app/_interface/tester";

// const ProfileSchema = z.object({
//   Firstname: z.string().min(2, {
//     message: "Firstname must be at least 2 characters.",
//   }),
//   Lastname: z.string().min(2, {
//     message: "Lastname must be at least 2 characters.",
//   }),
// });

// const AdditionalInfoSchema = z.object({
//   street: z.string().min(2, {
//     message: "Street must be at least 2 characters.",
//   }),
//   city: z.string().min(2, {
//     message: "City must be at least 2 characters.",
//   }),
//   state: z.string().min(2, {
//     message: "State must be at least 2 characters.",
//   }),
//   postalCode: z.string().min(5, {
//     message: "Postal Code must be at least 5 characters.",
//   }),
//   country: z.string().min(2, {
//     message: "Country must be at least 2 characters.",
//   }),
// });

// export default function TesterProfile() {
//   const [isEdit, setIsEdit] = useState<boolean>(false);
//   const [parsedData, setParsedData] = useState<any>(null);
//   const profileForm = useForm<z.infer<typeof ProfileSchema>>({
//     resolver: zodResolver(ProfileSchema),
//     defaultValues: {
//       Firstname: "",
//       Lastname: "",
//     },
//   });

//   const additionalInfoForm = useForm<z.infer<typeof AdditionalInfoSchema>>({
//     resolver: zodResolver(AdditionalInfoSchema),
//     defaultValues: {
//       street: "",
//       city: "",
//       state: "",
//       postalCode: "",
//       country: "",
//     },
//   });

//   useEffect(() => {
//     const storedData = localStorage.getItem(StorageKey.PRINCIPAL_USER);

//     if (storedData) {
//       // const data = JSON.parse(storedData);
//       const data = {
//         _id: "6715e3e235b1aedadfb7d88e",
//         email: "saurabh@excitesys.com",
//         firstName: "abc",
//         lastName: "dummy",
//         role: "TESTER",
//         createdAt: "2024-10-21T05:17:22.088Z",
//         updatedAt: "2024-10-21T05:17:22.088Z",
//         __v: 0,
//       };
//       setParsedData(data);
//       profileForm.reset({
//         Firstname: data.firstName || "",
//         Lastname: data.lastName || "",
//       });
//     }
//   }, [profileForm]);

//   function onProfileSubmit(data: z.infer<typeof ProfileSchema>) {
//     console.log("Profile Info:", data);
//   }

//   function onAdditionalInfoSubmit(data: z.infer<typeof AdditionalInfoSchema>) {
//     console.log("Additional Info:", data);
//   }

//   const getInputFeildsEnable = (parsedData : IAddressData, isEdit : boolean) => {
//     if (parsedData && parsedData.firstName && parsedData.lastName && !isEdit) {
//       return true;
//     }
//     return false;
//   };

//   return (
//     <>
//       <div className="grid grid-cols-12 gap-4 mt-6 p-4">
//         {/* User Info Section */}

//         <div className="col-span-6 p-4 rounded">
//           <p className="text-xs italic font-bold">Profile Info</p>
//           <Form {...profileForm}>
//             <form
//               onSubmit={profileForm.handleSubmit(onProfileSubmit)}
//               className="space-y-6"
//             >
//               <div className="flex space-x-4">
//                 <FormField
//                   control={profileForm.control}
//                   name="Firstname"
//                   render={({ field }) => (
//                     <FormItem className="w-1/2">
//                       <FormControl>
//                         <Input
//                           placeholder="First Name"
//                           {...field}
//                           readOnly={getInputFeildsEnable(parsedData, isEdit)}
//                           disabled={getInputFeildsEnable(parsedData, isEdit)}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={profileForm.control}
//                   name="Lastname"
//                   render={({ field }) => (
//                     <FormItem className="w-1/2">
//                       <FormControl>
//                         <Input
//                           placeholder="Last Name"
//                           {...field}
//                           readOnly={getInputFeildsEnable(parsedData, isEdit)}
//                           disabled={getInputFeildsEnable(parsedData, isEdit)}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="flex justify-end space-x-4">
//                 {parsedData?.firstName && parsedData?.lastName && !isEdit && (
//                   <Button type="button" onClick={() => setIsEdit(true)}>
//                     Edit
//                   </Button>
//                 )}

//                 {isEdit && (
//                   <>
//                     <Button type="button" onClick={() => setIsEdit(false)}>
//                       Cancel
//                     </Button>
//                     <Button type="submit">Save</Button>
//                   </>
//                 )}

//                 {(!parsedData?.firstName || !parsedData?.lastName) &&
//                   !isEdit && <Button type="submit">Save</Button>}
//               </div>
//             </form>
//           </Form>
//         </div>

//         {/* Address Section */}
//         <div className="col-span-6  p-4 rounded">
//           <p className="text-xs italic font-bold">Address</p>
//           <Form {...additionalInfoForm}>
//             <form
//               onSubmit={additionalInfoForm.handleSubmit(onAdditionalInfoSubmit)}
//               className="space-y-4"
//             >
//               <div className="flex space-x-4">
//                 <FormField
//                   control={additionalInfoForm.control}
//                   name="street"
//                   render={({ field }) => (
//                     <FormItem className="w-1/2">
//                       <FormControl>
//                         <Input placeholder="Street" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={additionalInfoForm.control}
//                   name="city"
//                   render={({ field }) => (
//                     <FormItem className="w-1/2">
//                       <FormControl>
//                         <Input placeholder="City" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Second Row with 3 Input Fields */}
//               <div className="flex space-x-4 mt-4">
//                 <FormField
//                   control={additionalInfoForm.control}
//                   name="state"
//                   render={({ field }) => (
//                     <FormItem className="w-1/3">
//                       <FormControl>
//                         <Input placeholder="State" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={additionalInfoForm.control}
//                   name="postalCode"
//                   render={({ field }) => (
//                     <FormItem className="w-1/3">
//                       <FormControl>
//                         <Input placeholder="Postal Code" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={additionalInfoForm.control}
//                   name="country"
//                   render={({ field }) => (
//                     <FormItem className="w-1/3">
//                       <FormControl>
//                         <Input placeholder="Country" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <Button type="submit">Save</Button>
//               </div>
//             </form>
//           </Form>
//         </div>
//       </div>
//     </>
//   );
// }

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { StorageKey } from "@/app/_constants/localstorage-keys";
import { IAddressData } from "@/app/_interface/tester";

const ProfileSchema = z.object({
  Firstname: z.string().min(2, {
    message: "Firstname must be at least 2 characters.",
  }),
  Lastname: z.string().min(2, {
    message: "Lastname must be at least 2 characters.",
  }),
});

const AdditionalInfoSchema = z.object({
  street: z.string().min(2, {
    message: "Street must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  postalCode: z
    .string()
    .length(6, {
      message: "Postal Code must be exactly 6 digits.",
    })
    .regex(/^\d{6}$/, {
      message: "Postal Code must contain only numbers.",
    }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
});

export default function TesterProfile() {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [initialValues, setInitialValues] = useState<{
    Firstname: string;
    Lastname: string;
  } | null>(null);

  const profileForm = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      Firstname: "",
      Lastname: "",
    },
  });

  const additionalInfoForm = useForm<z.infer<typeof AdditionalInfoSchema>>({
    resolver: zodResolver(AdditionalInfoSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
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

  function onAdditionalInfoSubmit(data: z.infer<typeof AdditionalInfoSchema>) {
    console.log("Additional Info:", data);
  }

  const getInputFeildsEnable = (parsedData: IAddressData, isEdit: boolean) => {
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

  return (
    <>
      <div className="grid grid-cols-12 gap-4 mt-6 p-4">
        {/* User Info Section */}

        <div className="col-span-6 p-4 rounded">
          <p className="text-xs italic font-bold">Profile Info</p>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-6"
            >
              <div className="flex space-x-4">
                <FormField
                  control={profileForm.control}
                  name="Firstname"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                          readOnly={getInputFeildsEnable(parsedData, isEdit)}
                          disabled={getInputFeildsEnable(parsedData, isEdit)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="Lastname"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          readOnly={getInputFeildsEnable(parsedData, isEdit)}
                          disabled={getInputFeildsEnable(parsedData, isEdit)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                {parsedData?.firstName && parsedData?.lastName && !isEdit && (
                  <Button type="button" onClick={() => setIsEdit(true)}>
                    Edit
                  </Button>
                )}

                {isEdit && (
                  <>
                    <Button type="button" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </>
                )}

                {(!parsedData?.firstName || !parsedData?.lastName) &&
                  !isEdit && <Button type="submit">Save</Button>}
              </div>
            </form>
          </Form>
        </div>

        {/* Address Section */}
        <div className="col-span-6  p-4 rounded">
          <p className="text-xs italic font-bold">Address</p>
          <Form {...additionalInfoForm}>
            <form
              onSubmit={additionalInfoForm.handleSubmit(onAdditionalInfoSubmit)}
              className="space-y-4"
            >
              <div className="flex space-x-4">
                <FormField
                  control={additionalInfoForm.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormControl>
                        <Input placeholder="Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={additionalInfoForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Second Row with 3 Input Fields */}
              <div className="flex space-x-4 mt-4">
                <FormField
                  control={additionalInfoForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormControl>
                        <Input placeholder="Postal Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={additionalInfoForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={additionalInfoForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
