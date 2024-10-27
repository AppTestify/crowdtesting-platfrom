"use client";

import { resendAccountVerificationMailService } from "@/app/_services/auth-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, Mail, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog } from "../confirmation-dialog";
import toasterService from "@/app/_services/toaster-service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { checkIfOneDayPassed, formatDate } from "@/app/_utils/date-formatters";

export default function ActivateAccountAlert({ user }: { user: any }) {
  const [isResendMailDialogOpen, setIsResendMailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const resendAccountVerificationMail = async () => {
    try {
      setIsLoading(true);
      const response = await resendAccountVerificationMailService();

      if (response?.message) {
        setIsLoading(false);
        setIsResendMailDialogOpen(false);
        setIsDisabled(true);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsResendMailDialogOpen(false);
      console.log("Error > resendAccountVerificationMail");
    }
  };

  return (
    <main>
      <ConfirmationDialog
        isOpen={isResendMailDialogOpen}
        setIsOpen={setIsResendMailDialogOpen}
        title="Resend account verification"
        description="Are you sure you want to resend account verfication mail?"
        isLoading={isLoading}
        successAction={resendAccountVerificationMail}
        successLabel="Resend"
        successLoadingLabel="Resending"
        successVariant={"default"}
      />

      <Alert>
        <div className="flex gap-4 flex-col md:flex-row md:items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <TriangleAlert className="h-4 w-4 hidden md:flex" />
            <AlertDescription>
              {!checkIfOneDayPassed(user.accountActivationMailSentAt) ||
              isDisabled ? (
                <span>
                  Verification mail sent, please wait for day before resending
                  the verification mail.
                </span>
              ) : (
                <span>
                  Your account is currently inactive. Please click on the link
                  sent on your email to activate your account.
                </span>
              )}
            </AlertDescription>
          </div>
          <div className="flex items-center gap-2">
            {user.accountActivationMailSentAt || isDisabled ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Clock className="h-4 w-4 text-gray-600" />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <span>
                      Last sent at{" "}
                      {formatDate(
                        user.accountActivationMailSentAt || new Date(),
                        true
                      )}{" "}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}

            <Button
              size={"sm"}
              disabled={
                !checkIfOneDayPassed(user.accountActivationMailSentAt) ||
                isDisabled
              }
              onClick={() => {
                setIsResendMailDialogOpen(true);
                setIsLoading(false);
              }}
            >
              <Mail /> Resend email
            </Button>
          </div>
        </div>
      </Alert>
    </main>
  );
}
