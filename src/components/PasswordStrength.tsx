const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const labels = ["Weak", "Fair", "Good", "Strong"] as const;
const colors = [
  "bg-destructive",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
];

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const strength = getStrength(password);
  const idx = Math.max(0, strength - 1);

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= idx ? colors[idx] : "bg-muted/30"
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] ${colors[idx].replace("bg-", "text-")}`}>
        {labels[idx]}
      </p>
    </div>
  );
};

export default PasswordStrength;
