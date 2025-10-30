import Hero from '../components/Hero';
import About from '../components/About';
import Businesses from '../components/Businesses';
import HowItWorks from '../components/HowItWorks';
import SignUpForm from '../components/SignUpForm';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Hero />
      <About />
      <Businesses />
      <HowItWorks />
      <SignUpForm />
      <Contact />
    </div>
  );
}
