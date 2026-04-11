"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const items = [
  {
    icon: Mail,
    title: "Email",
    value: "info@compareheathrowparking.uk",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "07508624155",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "103 Pennine Way UB3 5LJ",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Open 24/7, 365 days a year",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      await api.contact(data);

      setSubmitted(true);
      form.reset();
    } catch (err: unknown) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <PageHero title="Contact Us" subtitle="We're here to help" />
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="rounded-2xl border border-primary bg-card p-6 text-center text-card-foreground ring-0 lg:p-8">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold mb-6 text-foreground">
                Send us a message
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {submitted && (
                <Alert variant={"success"} className="mb-4">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Message sent successfully. We&apos;ll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Type your message..."
                            className=" "
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Error Alert */}
                  {form.formState.errors.root && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Something went wrong. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Sending..."
                      : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          {/* <div
            className="rounded-2xl border p-8"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: "var(--foreground)" }}
            >
              Send us a message
            </h2>
            {submitted ? (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <p className="font-bold" style={{ color: "var(--foreground)" }}>
                  Message sent!
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm"
                  style={{
                    background: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm"
                  style={{
                    background: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm resize-none"
                  style={{
                    background: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-bold"
                  style={{ background: "var(--primary)" }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div> */}
          <div className="space-y-6">
            {items.map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={i}
                  className="rounded-2xl border p-5 flex items-start gap-4"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className={`w-11 h-11 flex items-center justify-center rounded-xl ${item.bg} shrink-0 group-hover:scale-110 transition`}
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  {/* <span className="text-2xl">{item.icon}</span> */}
                  <div>
                    <h3
                      className="font-bold text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
