import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InteractiveSimulator } from './components/InteractiveSimulator';
import { ValueProps } from './components/ValueProps';
import { ModulesSection } from './components/ModulesSection';
import { HowItWorks } from './components/HowItWorks';
import { TargetAudience } from './components/TargetAudience';
import { ComparisonTable } from './components/ComparisonTable';
import { InstallationSection } from './components/InstallationSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { InstallationModal } from './components/InstallationModal';

export default function App() {
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const scrollToSimulator = () => {
    const el = document.getElementById('simulador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-app">
      {/* Top Navigation */}
      <Navbar onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      <main>
        {/* Hero Section */}
        <Hero 
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onScrollToSimulator={scrollToSimulator}
        />

        {/* Live Interactive Extension Simulator */}
        <InteractiveSimulator />

        {/* Core Value Propositions / Rigor */}
        <ValueProps />

        {/* Modules Breakdown */}
        <ModulesSection />

        {/* How It Works (Step-by-step) */}
        <HowItWorks />

        {/* Target Audience / Personas */}
        <TargetAudience />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Installation Section */}
        <InstallationSection onOpenModal={() => setIsInstallModalOpen(true)} />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal for Installation details */}
      <InstallationModal 
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
