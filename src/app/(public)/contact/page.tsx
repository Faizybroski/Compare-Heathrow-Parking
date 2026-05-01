"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { api } from "@/lib/api";
import PageHero from "@/components/shared/PageHero";

const ease = [0.22, 1, 0.36, 1] as const;

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormValues = z.infer<typeof formSchema>;

const items = [
  {
    icon: Mail,
    title: "Email",
    value: "info@compareheathrowparking.uk",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "07508624155",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "103 Pennine Way UB3 5LJ",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Open 24/7, 365 days a year",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await api.contact(data);
      setSubmitted(true);
      form.reset();
    } catch (err: unknown) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHero title="Contact Us" subtitle="We're here to help" />

      <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Form card */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease }}
            >
              <Card className="rounded-2xl border border-primary/15 bg-white shadow-sm h-full">
                <CardHeader className="p-6 sm:p-8 pb-0">
                  <CardTitle className="font-roboto text-xl font-bold text-foreground">
                    Send us a message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-4">
                  {submitted && (
                    <Alert variant="success" className="mb-5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription>
                        Message sent successfully. We&apos;ll get back to you soon.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Message</FormLabel>
                            <FormControl>
                              <Textarea rows={4} placeholder="Type your message..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.formState.errors.root && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Something went wrong. Please try again.
                          </AlertDescription>
                        </Alert>
                      )}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <button
                          type="submit"
                          disabled={form.formState.isSubmitting}
                          className="bg-purple-grad relative w-full inline-flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm overflow-hidden shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="absolute inset-0 pointer-events-none">
                            <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={1} />
                          </div>
                          <span className="relative z-10 flex items-center gap-2">
                            {form.formState.isSubmitting ? "Sending..." : (
                              <>
                                Send Message
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </span>
                        </button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact info cards */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: 32 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-start gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm shadow-black/5"
                  >
                    <motion.div
                      className="w-11 h-11 flex items-center justify-center rounded-md bg-primary/10 shrink-0"
                      whileHover={{ borderRadius: "50%" }}
                      transition={{ stiffness: 350 }}
                    >
                      <Icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
