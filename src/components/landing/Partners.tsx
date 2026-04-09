import { motion } from "framer-motion";
import { Satellite, Radio, Cpu, Rocket, Globe, Wifi } from "lucide-react";

const partners = [
  { name: "SpaceLink", icon: Satellite },
  { name: "OrbitTech", icon: Globe },
  { name: "SensorCore", icon: Cpu },
  { name: "LaunchBase", icon: Rocket },
  { name: "TeleSat", icon: Radio },
  { name: "AstroNet", icon: Wifi },
];

const Partners = () => {
  return (
    <section className="relative py-12 border-y border-border/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-8 font-semibold"
        >
          Trusted by Leading Space-Tech Partners
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground/50 hover:text-primary/70 transition-colors"
            >
              <p.icon className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide">{p.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
