import { type NextPage } from "next";
import Head from "next/head";
import { CallToAction } from "../components/landing/CallToAction";
import { Faqs } from "../components/landing/Faqs";
import { Footer } from "../components/landing/Footer";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { Pricing } from "../components/landing/Pricing";
import { PrimaryFeatures } from "../components/landing/PrimaryFeatures";
import { SecondaryFeatures } from "../components/landing/SecondaryFeatures";
import { Testimonials } from "../components/landing/Testimonials";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Portal</title>
        <meta
          name="description"
          content="We help you focus on your construction projects by taking care of mundane tasks like files processing, keeping track of your budget costs and more"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        <Testimonials />
        <Pricing />
        <Faqs />
      </main>
      <Footer />
    </>
  );
};

export default Home;
