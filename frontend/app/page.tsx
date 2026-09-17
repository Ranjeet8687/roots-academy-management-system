import { Navbar } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { WhyChoose } from "@/components/why-choose";
import { Courses } from "@/components/courses";
import { Faculty } from "@/components/faculty";
import { DemoLectures } from "@/components/demo-lectures";
import { Results } from "@/components/results";
import { Testimonials } from "@/components/testimonials";
import { Gallery } from "@/components/gallery";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <WhyChoose />
      <Courses />
      <Faculty />
      <DemoLectures />
      <Results />
      <Testimonials />
      <Gallery />
      <Contact />
      <Footer />
    </>
  );
}