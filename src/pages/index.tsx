import { isValid, parse } from "date-fns";
import { type NextPage } from "next";
import Head from "next/head";
import { Footer } from "../components/common/Footer";
import { Header } from "../components/common/Header";
import { CallToAction } from "../components/landing/CallToAction";
import { Faqs } from "../components/landing/Faqs";
import { Hero } from "../components/landing/Hero";
import { Pricing } from "../components/landing/Pricing";
import { PrimaryFeatures } from "../components/landing/PrimaryFeatures";
import { SecondaryFeatures } from "../components/landing/SecondaryFeatures";

const Home: NextPage = () => {
  console.log(isValid(parse("-2/04/1998", "dd/MM/yyyy", new Date())));
  console.log(parse("-2/04/1998", "dd/MM/yyyy", new Date()));
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
        <Pricing />
        <CallToAction />
        <Faqs />
      </main>
      <Footer />
    </>
  );
};

export default Home;
