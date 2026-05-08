import Hero from '../components/Hero';
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import HelpCategories from '../components/HelpCategories';
import Businesses from '../components/Businesses';
import ProblemSolution from '../components/ProblemSolution';
import AppDownload from '../components/AppDownload';
import SignUpForm from '../components/SignUpForm';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <div className="bg-white text-black">
      <Hero />
      <About />
      <HowItWorks />
      <HelpCategories />
      <Businesses />
      <ProblemSolution />
      <AppDownload />
      <SignUpForm />
      <Contact />
    </div>
  );
}
