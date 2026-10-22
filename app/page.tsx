import {
  Hero,
  HowItWorks,
  CarAlerts,
  Testimonials,
  ClosingCta,
  SiteFooter,
  ButtonEffects,
  ScrollEffects,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="overflow-x-clip bg-[#fff7ef] text-[#2a1512] antialiased">
      <Hero />
      <HowItWorks />
      <CarAlerts />
      <Testimonials />
      <ClosingCta />
      <SiteFooter />
      <ButtonEffects />
      <ScrollEffects />
    </div>
  );
}
