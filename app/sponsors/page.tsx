"use client";

import { useState } from "react";
import {
  Crown,
  Medal,
  Award,
  Heart,
  Check,
  Sparkles,
  Zap,
  Rocket,
  Building2,
  Mail,
  CreditCard,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

const sponsorTiers = [
  {
    name: "Gold",
    icon: <Crown className="w-8 h-8 text-yellow-400" />,
    price: 250,
    period: "month",
    color: "from-yellow-500 to-amber-500",
    borderColor: "border-yellow-500/50",
    bgColor: "bg-yellow-500/10",
    features: [
      "Logo placement on homepage (top section)",
      "Logo in header navigation",
      "Featured in sponsor section",
      "Dedicated thank you page",
      "Social media mentions",
      "Priority support",
      "Custom sponsorship package",
    ],
    popular: false,
  },
  {
    name: "Silver",
    icon: <Medal className="w-8 h-8 text-gray-300" />,
    price: 100,
    period: "month",
    color: "from-gray-400 to-gray-600",
    borderColor: "border-gray-400/50",
    bgColor: "bg-gray-400/10",
    features: [
      "Logo in sponsor section",
      "Logo in header navigation",
      "Mentioned in monthly newsletter",
      "Social media mention",
      "Standard support",
    ],
    popular: true,
  },
  {
    name: "Bronze",
    icon: <Award className="w-8 h-8 text-amber-600" />,
    price: 20,
    period: "month",
    color: "from-amber-600 to-orange-600",
    borderColor: "border-amber-600/50",
    bgColor: "bg-amber-600/10",
    features: [
      "Logo in sponsor section",
      "Thank you on sponsor page",
      "Community recognition",
    ],
    popular: false,
  },
];

export default function SponsorsPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleSponsorClick = (tierName: string) => {
    setSelectedTier(tierName);
  };

  const handlePayment = async (tier: (typeof sponsorTiers)[0]) => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: tier.name,
          amount: tier.price,
          email: email,
          companyName: companyName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // Fallback to email if Stripe is not configured
        const subject = encodeURIComponent(
          `Sponsorship Inquiry - ${tier.name} Tier`
        );
        const body = encodeURIComponent(
          `Hello DevSync Team,\n\nI'm interested in becoming a ${
            tier.name
          } sponsor.\n\nCompany: ${
            companyName || "N/A"
          }\nEmail: ${email}\nTier: ${tier.name}\nAmount: $${tier.price}/${
            tier.period
          }\n\nPlease let me know the next steps.\n\nBest regards`
        );
        window.location.href = `mailto:mohammadhussainafghan83@gmail.com?subject=${subject}&body=${body}`;
      }
    } catch (error) {
      console.error("Payment error:", error);
      // Fallback to email
      const subject = encodeURIComponent(
        `Sponsorship Inquiry - ${tier.name} Tier`
      );
      const body = encodeURIComponent(
        `Hello DevSync Team,\n\nI'm interested in becoming a ${
          tier.name
        } sponsor.\n\nCompany: ${
          companyName || "N/A"
        }\nEmail: ${email}\nTier: ${tier.name}\nAmount: $${tier.price}/${
          tier.period
        }\n\nPlease let me know the next steps.\n\nBest regards`
      );
      window.location.href = `mailto:mohammadhussainafghan83@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative font-sans text-gray-100 overflow-x-hidden">
      {/* Cosmic Aurora Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 65%)
          `,
        }}
      />

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          {/* Current Sponsors */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full mb-6">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-cyan-400 font-semibold">
                  Proudly Supported By
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                <span className="text-gray-300">Our Amazing</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Current Sponsors
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                These incredible organizations help make DevSync possible
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Supabase",
                  url: "https://supabase.com/",
                  logo: null,
                  tier: "Gold",
                },
                {
                  name: "GitHub",
                  url: "https://github.com/",
                  logo: null,
                  tier: "Silver",
                },
              ].map((sponsor, index) => {
                const tierColors = {
                  Gold: {
                    gradient:
                      "from-yellow-500/20 via-amber-500/20 to-yellow-400/20",
                    border: "border-yellow-500/50",
                    hoverBorder: "border-yellow-400/80",
                    glow: "shadow-yellow-500/20",
                    hoverGlow: "shadow-yellow-400/40",
                    iconColor: "text-yellow-400",
                    badgeBg:
                      "bg-gradient-to-r from-yellow-500/20 to-amber-500/20",
                    badgeBorder: "border-yellow-500/50",
                    badgeText: "text-yellow-300",
                  },
                  Silver: {
                    gradient:
                      "from-gray-400/20 via-slate-400/20 to-gray-300/20",
                    border: "border-gray-400/50",
                    hoverBorder: "border-gray-300/80",
                    glow: "shadow-gray-400/20",
                    hoverGlow: "shadow-gray-300/40",
                    iconColor: "text-gray-300",
                    badgeBg:
                      "bg-gradient-to-r from-gray-400/20 to-slate-400/20",
                    badgeBorder: "border-gray-400/50",
                    badgeText: "text-gray-200",
                  },
                  Bronze: {
                    gradient:
                      "from-amber-600/20 via-orange-600/20 to-amber-500/20",
                    border: "border-amber-600/50",
                    hoverBorder: "border-amber-500/80",
                    glow: "shadow-amber-600/20",
                    hoverGlow: "shadow-amber-500/40",
                    iconColor: "text-amber-500",
                    badgeBg:
                      "bg-gradient-to-r from-amber-600/20 to-orange-600/20",
                    badgeBorder: "border-amber-600/50",
                    badgeText: "text-amber-400",
                  },
                };
                const colors = sponsor.tier
                  ? tierColors[sponsor.tier as keyof typeof tierColors]
                  : {
                      gradient:
                        "from-purple-500/20 via-pink-500/20 to-purple-400/20",
                      border: "border-purple-500/50",
                      hoverBorder: "border-purple-400/80",
                      glow: "shadow-purple-500/20",
                      hoverGlow: "shadow-purple-400/40",
                      iconColor: "text-purple-400",
                      badgeBg:
                        "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
                      badgeBorder: "border-purple-500/50",
                      badgeText: "text-purple-300",
                    };

                return (
                  <a
                    key={index}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-3xl p-8 hover:border-opacity-80 transition-all duration-500 flex flex-col items-center justify-center min-h-[180px] hover:scale-[1.05] hover:shadow-2xl ${colors.hoverGlow} ${colors.glow} overflow-hidden`}
                  >
                    {/* Animated background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                    />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 w-full flex flex-col items-center">
                      {sponsor.logo ? (
                        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="h-16 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 flex items-center justify-center group-hover:border-purple-500/50 transition-all duration-300">
                            <Building2 className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                          </div>
                        </div>
                      )}

                      <h3 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors duration-300 text-center mb-2">
                        {sponsor.name}
                      </h3>

                      {sponsor.tier && (
                        <div
                          className={`mt-2 px-3 py-1.5 rounded-full ${colors.badgeBg} border ${colors.badgeBorder} backdrop-blur-sm flex items-center gap-1.5 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {sponsor.tier === "Gold" && (
                            <Crown
                              className={`w-4 h-4 ${colors.iconColor} drop-shadow-lg`}
                            />
                          )}
                          {sponsor.tier === "Silver" && (
                            <Medal
                              className={`w-4 h-4 ${colors.iconColor} drop-shadow-lg`}
                            />
                          )}
                          {sponsor.tier === "Bronze" && (
                            <Award
                              className={`w-4 h-4 ${colors.iconColor} drop-shadow-lg`}
                            />
                          )}
                          <span
                            className={`text-xs font-bold ${colors.badgeText} tracking-wide`}
                          >
                            {sponsor.tier}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Corner accent */}
                    <div
                      className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-30 rounded-bl-full transition-opacity duration-500`}
                    />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-1.5 rounded-full mb-6">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-purple-400 font-semibold">
                  Support DevSync
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6">
                <span className="text-gray-300">Become a</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Sponsor
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Help us build the future of developer collaboration. Your
                support enables us to keep DevSync free and accessible to
                developers worldwide.
              </p>
            </div>

            {/* Sponsor Tiers */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {sponsorTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative bg-gray-900/40 backdrop-blur-sm border-2 ${
                    tier.popular
                      ? `${tier.borderColor} border-opacity-100 scale-105`
                      : "border-gray-800/50"
                  } rounded-2xl p-8 hover:border-opacity-100 transition-all duration-300`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">{tier.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        ${tier.price}
                      </span>
                      <span className="text-gray-400">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setSelectedTier(tier.name);
                      document
                        .getElementById("sponsor-form")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      tier.popular
                        ? `bg-gradient-to-r ${tier.color} text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50`
                        : "bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800/70"
                    }`}
                  >
                    Choose {tier.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Sponsor Form Section */}
            <div
              id="sponsor-form"
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 mb-16"
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 text-center">
                  Get Started
                </h2>
                <p className="text-gray-400 text-center mb-8">
                  Fill out the form below or contact us directly to become a
                  sponsor
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  {selectedTier && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <p className="text-sm text-gray-300 mb-2">
                        Selected Tier:
                      </p>
                      <p className="text-lg font-bold text-purple-400">
                        {selectedTier}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        if (selectedTier) {
                          const tier = sponsorTiers.find(
                            (t) => t.name === selectedTier
                          );
                          if (tier) handlePayment(tier);
                        }
                      }}
                      disabled={!selectedTier || !email}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </button>
                    <a
                      href="mailto:mohammadhussainafghan83@gmail.com?subject=Sponsorship Inquiry"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-xl font-semibold text-gray-300 hover:bg-gray-800/70 transition-all"
                    >
                      <Mail className="w-5 h-5" />
                      Contact Us
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-800/50">
                    <Shield className="w-4 h-4" />
                    <span>
                      Secure payment processing via Stripe. We'll never share
                      your information.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Sponsor Section */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                {
                  icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
                  title: "Reach Developers",
                  desc: "Connect with thousands of active developers building real projects",
                },
                {
                  icon: <Sparkles className="w-6 h-6 text-purple-400" />,
                  title: "Brand Visibility",
                  desc: "Get your brand in front of the developer community",
                },
                {
                  icon: <Rocket className="w-6 h-6 text-pink-400" />,
                  title: "Support Innovation",
                  desc: "Help us build tools that empower developers worldwide",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-cyan-500/30">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
