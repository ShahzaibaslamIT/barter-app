"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, ChevronDown } from "lucide-react";

export default function AcceptTermsPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already accepted, skip to home
  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.terms_accepted) {
          router.replace("/home");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/accept-terms", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to accept terms");
        return;
      }

      // Force full page reload to refresh session
      window.location.href = "/home";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-100 mb-4">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
          <p className="text-slate-500 mt-2">Please review and accept our terms to continue using BarterHub</p>
        </div>

        {/* Terms Content */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-[400px] sm:h-[500px] overflow-y-auto p-6 sm:p-8 text-sm text-slate-600 leading-relaxed space-y-6">

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using the BarterHub platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to all of these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you ("User") and BarterHub ("Company", "we", "us").</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Eligibility</h2>
              <p>You must be at least 18 years of age to use this Service. By using BarterHub, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into a binding agreement. Users under 18 are strictly prohibited from using the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. Account Registration</h2>
              <p>To use certain features of the Service, you must register for an account. You agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Not create multiple accounts for deceptive purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Listing & Bartering Rules</h2>
              <p>When creating listings or engaging in barter transactions, you agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide accurate descriptions and genuine photographs of items/services</li>
                <li>Not list prohibited, illegal, counterfeit, stolen, or hazardous items</li>
                <li>Not post misleading, deceptive, or fraudulent listings</li>
                <li>Honor barter agreements once both parties have accepted an offer</li>
                <li>Communicate respectfully and honestly with other users</li>
                <li>Not use the platform for money laundering or any illegal financial activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Prohibited Items & Services</h2>
              <p>The following items and services are strictly prohibited on BarterHub:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Weapons, firearms, ammunition, or explosives</li>
                <li>Illegal drugs, controlled substances, or drug paraphernalia</li>
                <li>Stolen property or goods obtained through illegal means</li>
                <li>Counterfeit or pirated products</li>
                <li>Adult content, pornography, or sexually explicit material</li>
                <li>Human remains, body parts, or organs</li>
                <li>Live animals (unless legally permitted and properly documented)</li>
                <li>Hazardous materials or recalled products</li>
                <li>Services that promote illegal activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Harass, abuse, threaten, or intimidate other users</li>
                <li>Post hate speech, discriminatory content, or offensive material</li>
                <li>Spam, phish, or send unsolicited communications</li>
                <li>Impersonate any person or entity</li>
                <li>Attempt to gain unauthorized access to other users' accounts</li>
                <li>Use automated tools, bots, or scrapers on the platform</li>
                <li>Manipulate ratings, reviews, or feedback systems</li>
                <li>Interfere with the proper functioning of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Content & Intellectual Property</h2>
              <p>By posting content (photos, descriptions, messages) on BarterHub, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute such content in connection with the Service. You represent that you own or have the necessary rights to all content you post. We reserve the right to remove any content that violates these Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Privacy & Data Collection</h2>
              <p>Your privacy is important to us. By using BarterHub, you consent to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Collection of personal information including name, email, phone number, and location data</li>
                <li>Use of location data to provide proximity-based listing features</li>
                <li>Storage of transaction history and communication records</li>
                <li>Use of analytics to improve our Service</li>
                <li>Receiving notifications related to your account and transactions</li>
              </ul>
              <p className="mt-2">We will not sell your personal information to third parties. Data is processed and stored in accordance with applicable data protection laws.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Account Suspension & Termination</h2>
              <p>We reserve the right to suspend, restrict, or terminate your account at our sole discretion if you:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Violate any of these Terms and Conditions</li>
                <li>Engage in fraudulent or deceptive behavior</li>
                <li>Receive multiple verified complaints from other users</li>
                <li>Post prohibited items or engage in prohibited activities</li>
              </ul>
              <p className="mt-2">Enforcement actions include warnings, temporary suspension (up to 30 days), blacklisting (10-15 days), and permanent bans. Repeated violations will result in escalated enforcement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Disclaimer of Warranties</h2>
              <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. We do not guarantee the quality, safety, or legality of items listed; the accuracy of listings or user content; or that the Service will be uninterrupted or error-free. BarterHub is a platform that connects users — we are not a party to any barter transaction and bear no responsibility for the outcome of trades.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">11. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, BARTERHUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. Our total liability shall not exceed the amount you have paid to BarterHub in the twelve (12) months preceding the claim. You agree to conduct in-person exchanges in safe, public locations and assume all risks associated with barter transactions.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">12. Dispute Resolution</h2>
              <p>Any disputes arising from or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in accordance with the laws of Pakistan. Users waive any right to participate in class-action lawsuits against BarterHub.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">13. Modifications to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on the platform. Your continued use of the Service after changes constitutes acceptance of the modified Terms. We will make reasonable efforts to notify users of significant changes via email or in-app notifications.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">14. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to conflict of law principles. Any legal proceedings shall be conducted in the courts of Karachi, Sindh, Pakistan.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">15. Contact Information</h2>
              <p>For questions or concerns regarding these Terms, please contact us at:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Email: support@barterhub.com</li>
                <li>Platform: BarterHub App — Report section</li>
              </ul>
            </section>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-400">
              <p>Last updated: April 5, 2026</p>
              <p>Version 1.0</p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex items-center justify-center py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 gap-1">
            <ChevronDown className="h-3 w-3 animate-bounce" />
            Scroll to read all terms
          </div>
        </div>

        {/* Accept checkbox */}
        <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-colors mb-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-sm text-slate-700">
            I have read and agree to the <strong>Terms & Conditions</strong>, <strong>Privacy Policy</strong>, and <strong>Community Guidelines</strong> of BarterHub. I understand that violation of these terms may result in account suspension or termination.
          </span>
        </label>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Accept button */}
        <button
          onClick={handleAccept}
          disabled={!accepted || loading}
          className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            accepted
              ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-200"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          } disabled:opacity-60`}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Accept & Continue
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          By clicking "Accept & Continue", you acknowledge that you have read, understood, and agree to be bound by these Terms.
        </p>
      </div>
    </div>
  );
}
