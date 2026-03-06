import {
  Header,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  PricingSection,
  CTASection,
  Footer,
} from "./components/landing";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Decorative Glows */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#00ff9d]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
