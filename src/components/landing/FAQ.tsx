import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is AegisSpace AI and how does it work?",
    answer: "AegisSpace AI is a real-time satellite launch monitoring platform that uses ESP32 hardware sensors to collect telemetry data (temperature, voltage, current, gyroscope). This data flows through our AI pipeline for anomaly detection and predictive failure analysis, displayed on a live 3D dashboard.",
  },
  {
    question: "Do I need my own ESP32 hardware to use the platform?",
    answer: "While AegisSpace AI is designed to work with ESP32 sensor data, you can explore the dashboard and AI features with simulated data. For full real-time monitoring, you'll need an ESP32 board configured with our firmware to send telemetry data.",
  },
  {
    question: "How does the AI anomaly detection work?",
    answer: "Our AI models analyze multi-sensor correlations across temperature, voltage, current, and gyroscope streams. When patterns deviate from established baselines, the system flags potential anomalies with severity levels and recommended actions — often before human operators notice.",
  },
  {
    question: "Can I integrate AegisSpace AI with my existing mission control systems?",
    answer: "Yes. AegisSpace AI provides REST APIs and webhook integrations for connecting with existing ground station software, n8n workflows, and custom automation pipelines. Enterprise plans include dedicated integration support.",
  },
  {
    question: "What kind of support is available for Enterprise customers?",
    answer: "Enterprise customers receive dedicated onboarding, custom API integrations, priority support with <1hr response time, custom AI model training on your specific hardware profiles, and a dedicated account manager.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">FAQ</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Got Questions? <span className="gradient-text">We've Got You Covered.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-xl border-border/30 px-6"
              >
                <AccordionTrigger className="text-left text-sm lg:text-base font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
