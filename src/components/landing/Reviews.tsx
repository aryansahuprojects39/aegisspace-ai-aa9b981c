import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    company: "OrbitMinds",
    name: "Priya Sharma",
    role: "CTO",
    initials: "PS",
    rating: 5,
    quote: "AegisSpace AI cut our anomaly response time by 80%. The FLARE module integration was plug-and-play — we were live in under an hour.",
  },
  {
    company: "NovaSat Labs",
    name: "Marcus Chen",
    role: "Lead Engineer",
    initials: "MC",
    rating: 5,
    quote: "The FLARE module integration was seamless. Real-time telemetry with AI-powered predictions gave us confidence we never had before launch.",
  },
  {
    company: "Stellar Dynamics",
    name: "Elena Voss",
    role: "Founder & CEO",
    initials: "EV",
    rating: 5,
    quote: "Best monitoring platform for small sat missions. The 3D digital twin dashboard is a game-changer for our investors and mission ops team.",
  },
  {
    company: "RocketBay",
    name: "James Okoye",
    role: "Mission Director",
    initials: "JO",
    rating: 4,
    quote: "Real-time telemetry changed how we operate. We caught a thermal anomaly 12 minutes before it would have scrubbed our launch.",
  },
];

const Reviews = () => {
  return (
    <section id="reviews" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-purple/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Reviews</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            What Our Clients <span className="gradient-text">Say</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Trusted by startups and space companies pushing boundaries.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="glass rounded-2xl p-6 flex flex-col gap-4 card-tilt"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-cyan-pink flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{review.name}</div>
                  <div className="text-xs text-muted-foreground">{review.role}, {review.company}</div>
                </div>
              </div>

              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-3.5 h-3.5 ${si < review.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{review.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
