import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EmailCaptureFormProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  compact?: boolean;
}

export default function EmailCaptureForm({
  source = "homepage",
  placeholder = "Enter your email",
  buttonText = "Get Free Guide",
  compact = false,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = trpc.email.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsSuccess(true);
        setEmail("");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Subscription failed: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    subscribeMutation.mutate({
      email: email.trim(),
      source,
    });
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center gap-3 ${compact ? 'justify-center' : 'justify-start'} text-accent`}>
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Thanks! Check your email for next steps.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex ${compact ? 'flex-col sm:flex-row' : 'flex-col md:flex-row'} gap-3 w-full`}>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 h-12"
          disabled={subscribeMutation.isPending}
          required
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={subscribeMutation.isPending}
        className={compact ? 'w-full sm:w-auto' : 'w-full md:w-auto'}
      >
        {subscribeMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
}
