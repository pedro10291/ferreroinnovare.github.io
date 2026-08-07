import React from 'react';
import { HeroEditorial } from './sections/HeroEditorial';
import { AuthoritySection } from './sections/AuthoritySection';
import { ExpertiseSection } from './sections/ExpertiseSection';
import { BookingSection } from './sections/BookingSection';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-clinic-bg text-clinic-textPrimary">
      <HeroEditorial />
      <AuthoritySection />
      <ExpertiseSection />
      <BookingSection />
    </div>
  );
};

export default LandingPage;
