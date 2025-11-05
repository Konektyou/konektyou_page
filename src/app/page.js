import Hero from '../components/Hero';
import About from '../components/About';
import ProblemSolution from '../components/ProblemSolution';
import HelpCategories from '../components/HelpCategories';
import Businesses from '../components/Businesses';
import HowItWorks from '../components/HowItWorks';
import SignUpForm from '../components/SignUpForm';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Hero />
      <About />
      <ProblemSolution />
      <HelpCategories />
      <Businesses />
      <HowItWorks />
      <SignUpForm />
      <Contact />
    </div>
  );
}
