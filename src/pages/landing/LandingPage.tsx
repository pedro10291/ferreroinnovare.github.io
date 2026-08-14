import React from 'react';
import { HeroEditorial } from './sections/HeroEditorial';
import { ExpertiseSection } from './sections/ExpertiseSection';
import { InstagramSection } from './sections/InstagramSection';
import { Reviews } from './sections/Reviews';
import { BookingSection } from './sections/BookingSection';
import { LocationSection } from './sections/LocationSection';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-clinic-bg text-clinic-textPrimary">
      <HeroEditorial />
      <ExpertiseSection />
      <InstagramSection />
      <Reviews />
      <BookingSection />
      <LocationSection />
    </div>
  );
};

export default LandingPage;
