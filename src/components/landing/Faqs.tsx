import Image from "next/image";

import { Container } from "../common/Container";

const faqs = [
  [
    {
      question: "Why do I need an automated financial tool?",
      answer:
        "Without such a tool, you would have to manually enter costs from the invoices you receive, which can be a time-consuming process.",
    },
    {
      question:
        "How do I know if I want to subscribe for the paid packages or not?",
      answer:
        "There is a free version where you can try out before paying for an upgraded version. No hidden fees.",
    },
  ],
  [
    {
      question: "How accurate is your AI?",
      answer:
        "If you are using our invoice template provided, accuracy rate will be 100%. However, if you are using your own invoice template, we have between an 80-99% accuracy rate, but this improves as the AI learns your business and document types.",
    },
    {
      question:
        "Some of the project costs do not have an invoice. How do I record them so that the budget and profit margin can reflect it too?",
      answer:
        "You can enter cost data manually aside from costs captured from an invoice.",
    },
  ],
  [
    {
      question: "Does hyperbolt read my email?",
      answer:
        "No, your privacy is important to us, and the email connection is only used to import any invoices that have been sent automatically. Our platform never reads or stores your email data, besides attached documents.",
    },
    {
      question: "How does the financial automation process work? ",
      answer: "You upload an invoice and our tech takes care of the rest.",
    },
  ],
];

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={"/images/background-faqs.jpg"}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team
            and if you’re lucky someone will get back to you.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
